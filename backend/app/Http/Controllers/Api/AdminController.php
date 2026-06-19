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
    $totalUsers    = User::count();
    $totalDemandes = \App\Models\Demande::count();

    $demandesParStatut = [
        'en_attente' => \App\Models\Demande::where('statut', 'en_attente')->count(),
        'en_cours'   => \App\Models\Demande::where('statut', 'en_cours')->count(),
        'prete'      => \App\Models\Demande::where('statut', 'prete')->count(),
        'refusee'    => \App\Models\Demande::where('statut', 'refusee')->count(),
    ];

    // ── Performance agents : champs alignés avec le frontend ──
    $agentsPerformance = User::whereIn('role', ['agentScolarite', 'chefScolarite'])
        ->where('actif', true)
        ->leftJoin('demandes', function($join) {
            $join->on('demandes.traite_par', '=', 'users.id')
                 ->whereNotNull('demandes.traite_par');
        })
        ->selectRaw('
            users.id,
            users.nom,
            users.prenom,
            users.role,
            COUNT(demandes.id) as total,
            SUM(CASE WHEN demandes.statut = "prete"   THEN 1 ELSE 0 END) as prete,
            SUM(CASE WHEN demandes.statut = "refusee" THEN 1 ELSE 0 END) as refusee
        ')
        ->groupBy('users.id', 'users.nom', 'users.prenom', 'users.role')
        ->orderByDesc('total')
        ->get();

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
        'total_users'         => $totalUsers,
        'total_demandes'      => $totalDemandes,
        'demandes_par_statut' => $demandesParStatut,
        'agents_performance'  => $agentsPerformance,
        'activite_recente'    => $activiteRecente,
        'users_par_role'      => [
            'admin'          => User::where('role', 'admin')->count(),
            'chefScolarite'  => User::where('role', 'chefScolarite')->count(),
            'agentScolarite' => User::where('role', 'agentScolarite')->count(),
        ],
    ], 200);
}
}