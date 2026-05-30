<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();

        $stats = [
            'total' => $users->count(),
            'admins' => $users->where('role', 'admin')->count(),
            'chefs' => $users->where('role', 'chefScolarite')->count(),
            'agents' => $users->where('role', 'agentScolarite')->count(),
            'actifs' => $users->where('actif', true)->count(),
            'inactifs' => $users->where('actif', false)->count(),
        ];

        return response()->json([
            'users' => $users,
            'stats' => $stats,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,chefScolarite,agentScolarite',
        ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $user = new User();
    $user->nom = $request->input('nom');
    $user->prenom = $request->input('prenom');
    $user->email = $request->input('email');
    $user->password = Hash::make($request->input('password'));
    $user->role = $request->input('role');
    $user->actif = true;
    $user->save();

    return response()->json([
        'message' => 'Utilisateur créé avec succès',
        'user' => $user,
    ], 201);
}

    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        return response()->json($user, 200);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:100',
            'prenom' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:admin,chefScolarite,agentScolarite',
            'password' => 'sometimes|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['nom', 'prenom', 'email', 'role']);

        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Utilisateur modifié avec succès',
            'user' => $user,
        ], 200);
    }

    public function toggleActif($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $user->update(['actif' => !$user->actif]);

        $message = $user->actif ? 'Utilisateur activé' : 'Utilisateur désactivé';

        return response()->json([
            'message' => $message,
            'user' => $user,
        ], 200);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Impossible de supprimer un administrateur'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ], 200);
    }

    public function dashboard()
    {
        $totalUsers = User::count();
        $totalDemandes = \App\Models\Demande::count();

        $demandesParStatut = [
            'en_attente' => \App\Models\Demande::where('statut', 'en_attente')->count(),
            'en_cours' => \App\Models\Demande::where('statut', 'en_cours')->count(),
            'prete' => \App\Models\Demande::where('statut', 'prete')->count(),
            'refusee' => \App\Models\Demande::where('statut', 'refusee')->count(),
        ];

        $agentsPerformance = \App\Models\Demande::whereNotNull('traite_par')
            ->with('traitePar')
            ->selectRaw('traite_par, COUNT(*) as total,
                         SUM(CASE WHEN statut = "prete" THEN 1 ELSE 0 END) as validees,
                         SUM(CASE WHEN statut = "refusee" THEN 1 ELSE 0 END) as refusees,
                         AVG(TIMESTAMPDIFF(HOUR, date_creation, date_traitement)) as temps_moyen')
            ->groupBy('traite_par')
            ->get()
            ->map(function($item) {
                return [
                    'agent' => $item->traitePar ? $item->traitePar->prenom . ' ' . $item->traitePar->nom : 'Inconnu',
                    'role' => $item->traitePar?->role,
                    'total_traitees' => $item->total,
                    'validees' => $item->validees,
                    'refusees' => $item->refusees,
                    'temps_moyen_heures' => round($item->temps_moyen, 1),
                ];
            });

        $activiteRecente = \App\Models\Demande::with('traitePar')
            ->whereNotNull('traite_par')
            ->orderBy('date_traitement', 'desc')
            ->take(10)
            ->get()
            ->map(function($demande) {
            return [
            'id'            => $demande->id,
            'type_document' => $demande->type_document,
            'statut'        => $demande->statut,
            'nom'           => $demande->nom,
            'prenom'        => $demande->prenom,
            'traite_par'    => $demande->traitePar?->prenom . ' ' . $demande->traitePar?->nom,
            'date_creation' => $demande->date_creation,
            'date'          => $demande->date_traitement ?? $demande->date_creation,
        ];
        });

        return response()->json([
            'total_users' => $totalUsers,
            'total_demandes' => $totalDemandes,
            'demandes_par_statut' => $demandesParStatut,
            'agents_performance' => $agentsPerformance,
            'activite_recente' => $activiteRecente,
            'users_par_role' => [
                'admin' => User::where('role', 'admin')->count(),
                'chefScolarite' => User::where('role', 'chefScolarite')->count(),
                'agentScolarite' => User::where('role', 'agentScolarite')->count(),
            ],
        ], 200);
    }
}