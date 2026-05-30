<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Services\ApogeeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Services\PdfService;
use App\Mail\DocumentPretMail;
use App\Mail\DemandeRefuseeMail;
use Illuminate\Support\Facades\Mail;

class DemandeController extends Controller
{
    protected $apogeeService;
    protected $pdfService;

    public function __construct(ApogeeService $apogeeService, PdfService $pdfService)
    {
        $this->apogeeService = $apogeeService;
        $this->pdfService = $pdfService;
    }

    public function index(Request $request)
    {
        $query = Demande::with(['traitePar', 'document']);

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('type_document')) {
            $query->where('type_document', $request->type_document);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhere('cne', 'like', "%{$search}%")
                  ->orWhere('code_apogee', 'like', "%{$search}%");
            });
        }

        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->whereBetween('date_creation', [
                $request->date_debut,
                $request->date_fin
            ]);
        }

        $demandes = $query->orderBy('date_creation', 'desc')->paginate(10);

        return response()->json($demandes, 200);
    }

    public function store(Request $request)
    {
       $validator = Validator::make($request->all(), [
        'cne' => 'required|string',
        'code_apogee' => 'required|integer',
        'nom' => 'required|string|max:255',
        'prenom' => 'required|string|max:255',
        'email' => 'required|email|max:100',
        'type_document' => 'required|in:attestation_inscription,certificat_scolarite,releve_notes,diplome_deust,retrait_bac',
        'semestre' => 'required_if:type_document,releve_notes|integer|in:1,2,3,4|nullable',
        'type_retrait' => 'required_if:type_document,retrait_bac|in:temporaire,definitif|nullable',
        'commentaire' => 'nullable|string|max:1000',
    ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $demande = Demande::create([
            'cne' => $request->cne,
            'code_apogee' => $request->code_apogee,
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'date_creation' => Carbon::now(),
            'statut' => 'en_attente',
            'type_document' => $request->type_document,
            'semestre' => $request->semestre,
            'type_retrait' => $request->type_retrait,
            'commentaire' => $request->commentaire,
        ]);

        $demande->load(['traitePar', 'document']);

        return response()->json([
            'message' => 'Demande créée avec succès',
            'demande' => $demande
        ], 201);
    }

    public function show($id)
    {
        $demande = Demande::with(['traitePar', 'document'])->find($id);

        if (!$demande) {
            return response()->json(['message' => 'Demande non trouvée'], 404);
        }

        return response()->json($demande, 200);
    }

    public function valider(Request $request, $id)
{
    $demande = Demande::find($id);

    if (!$demande) {
        return response()->json(['message' => 'Demande non trouvée'], 404);
    }

    if ($demande->statut !== 'en_attente' && $demande->statut !== 'en_cours') {
        return response()->json(['message' => 'Cette demande ne peut pas être validée'], 400);
    }

    $etudiantApogee = $this->apogeeService->verifierEtudiant(
        $demande->cne,
        $demande->code_apogee,
        $demande->nom,
        $demande->prenom
    );

    if (!$etudiantApogee) {
        $demande->update([
            'statut' => 'refusee',
            'date_traitement' => Carbon::now(),
            'traite_par' => $request->user()->id,
            'motif_refus' => 'Informations incorrectes. Vérifiez votre CNE, code Apogée, nom et prénom.',
        ]);

        Mail::to($demande->email)->send(new DemandeRefuseeMail($demande));

        return response()->json([
            'message' => 'Étudiant non trouvé dans Apogée. Email de refus envoyé.',
            'demande' => $demande
        ], 404);
    }

    $demande->update([
        'statut' => 'prete',
        'date_traitement' => Carbon::now(),
        'traite_par' => $request->user()->id,
    ]);

    if ($demande->type_document !== 'retrait_bac') {
        $this->pdfService->genererDocument($demande);
    }

    Mail::to($demande->email)->send(new DocumentPretMail($demande));

    $demande->load(['traitePar', 'document']);

    return response()->json([
        'message' => 'Demande validée. Document prêt. Email envoyé.',
        'demande' => $demande
    ], 200);
}

    public function refuser(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'motif_refus' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $demande = Demande::find($id);

        if (!$demande) {
            return response()->json(['message' => 'Demande non trouvée'], 404);
        }

        if ($demande->statut !== 'en_attente' && $demande->statut !== 'en_cours') {
            return response()->json(['message' => 'Cette demande ne peut pas être refusée'], 400);
        }

        $demande->update([
            'statut' => 'refusee',
            'date_traitement' => Carbon::now(),
            'traite_par' => $request->user()->id,
            'motif_refus' => $request->motif_refus,
        ]);

        $demande->load(['traitePar', 'document']);

        return response()->json([
            'message' => 'Demande refusée',
            'demande' => $demande
        ], 200);
    }

    public function mettreEnCours(Request $request, $id)
    {
        $demande = Demande::find($id);

        if (!$demande) {
            return response()->json(['message' => 'Demande non trouvée'], 404);
        }

        if ($demande->statut !== 'en_attente') {
            return response()->json(['message' => 'Seules les demandes en attente peuvent être mises en cours'], 400);
        }

        $demande->update([
            'statut' => 'en_cours',
            'traite_par' => $request->user()->id,
        ]);

        $demande->load(['traitePar', 'document']);

        return response()->json([
            'message' => 'Demande mise en cours de traitement',
            'demande' => $demande
        ], 200);
    }

    public function statistiques(Request $request)
{
    $periode = $request->get('periode', 'tout');
    
    $dateDebut = match($periode) {
        'aujourd_hui' => Carbon::today(),
        'cette_semaine' => Carbon::now()->startOfWeek(),
        'ce_mois' => Carbon::now()->startOfMonth(),
        'cette_annee' => Carbon::now()->startOfYear(),
        default => null,
    };

    $query = Demande::query();
    
    if ($dateDebut) {
        $query->where('date_creation', '>=', $dateDebut);
    }

    $total = (clone $query)->count();
    $en_attente = (clone $query)->where('statut', 'en_attente')->count();
    $en_cours = (clone $query)->where('statut', 'en_cours')->count();
    $prete = (clone $query)->where('statut', 'prete')->count();
    $refusee = (clone $query)->where('statut', 'refusee')->count();

    $tempsReponseMoyen = (clone $query)
        ->whereNotNull('date_traitement')
        ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, date_creation, date_traitement)) as temps_moyen')
        ->value('temps_moyen');

    $goulots = (clone $query)
        ->where('statut', 'en_attente')
        ->where('date_creation', '<', Carbon::now()->subHours(48))
        ->count();

    $parType = [
        'attestation_inscription' => (clone $query)->where('type_document', 'attestation_inscription')->count(),
        'certificat_scolarite' => (clone $query)->where('type_document', 'certificat_scolarite')->count(),
        'releve_notes' => (clone $query)->where('type_document', 'releve_notes')->count(),
        'diplome_deust' => (clone $query)->where('type_document', 'diplome_deust')->count(),
        'retrait_bac' => (clone $query)->where('type_document', 'retrait_bac')->count(),
    ];

    $parAgent = Demande::whereNotNull('traite_par')
    ->whereBetween('date_traitement', [$dateDebut ?? Carbon::now()->subYear(), Carbon::now()])
    ->join('users', 'demandes.traite_par', '=', 'users.id')
    ->selectRaw('
        demandes.traite_par,
        users.nom,
        users.prenom,
        COUNT(*) as total,
        SUM(CASE WHEN demandes.statut = "prete" THEN 1 ELSE 0 END) as prete,
        SUM(CASE WHEN demandes.statut = "refusee" THEN 1 ELSE 0 END) as refusee
    ')
    ->groupBy('demandes.traite_par', 'users.nom', 'users.prenom')
    ->get();

    $evolutionParJour = Demande::when($dateDebut, fn($q) => $q->where('date_creation', '>=', $dateDebut))
        ->selectRaw('DATE(date_creation) as jour, COUNT(*) as total')
        ->groupBy('jour')
        ->orderBy('jour')
        ->get();

    return response()->json([
        'periode' => $periode,
        'resume' => [
            'total' => $total,
            'en_attente' => $en_attente,
            'en_cours' => $en_cours,
            'prete' => $prete,
            'refusee' => $refusee,
            'taux_traitement' => $total > 0 ? round((($prete + $refusee) / $total) * 100, 1) : 0,
        ],
        'performance' => [
            'temps_reponse_moyen_heures' => round($tempsReponseMoyen, 1),
            'demandes_en_retard' => $goulots,
        ],
        'par_type_document' => $parType,
        'par_agent' => $parAgent,
        'evolution_par_jour' => $evolutionParJour,
    ], 200);
}
    public function historique(Request $request, $cne)
{
    $demandes = Demande::with(['traitePar', 'document'])
        ->where('cne', $cne)
        ->orderBy('date_creation', 'desc')
        ->get();

    if ($demandes->isEmpty()) {
        return response()->json([
            'message' => 'Aucune demande trouvée pour cet étudiant',
            'cne' => $cne,
            'historique' => []
        ], 200);
    }

    $resume = [
        'total' => $demandes->count(),
        'en_attente' => $demandes->where('statut', 'en_attente')->count(),
        'en_cours' => $demandes->where('statut', 'en_cours')->count(),
        'prete' => $demandes->where('statut', 'prete')->count(),
        'refusee' => $demandes->where('statut', 'refusee')->count(),
    ];

    return response()->json([
        'cne' => $cne,
        'etudiant' => [
            'nom' => $demandes->first()->nom,
            'prenom' => $demandes->first()->prenom,
            'code_apogee' => $demandes->first()->code_apogee,
        ],
        'resume' => $resume,
        'historique' => $demandes,
    ], 200);
}
}