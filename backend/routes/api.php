<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DemandeController;
use App\Http\Controllers\Api\AdminController;

Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/register', [AuthController::class, 'register']);

Route::post('demandes', [DemandeController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::get('demandes', [DemandeController::class, 'index']);
    Route::get('demandes/statistiques', [DemandeController::class, 'statistiques']);
    Route::get('demandes/{id}', [DemandeController::class, 'show']);
    Route::put('demandes/{id}/valider', [DemandeController::class, 'valider']);
    Route::put('demandes/{id}/refuser', [DemandeController::class, 'refuser']);
    Route::put('demandes/{id}/mettre-en-cours', [DemandeController::class, 'mettreEnCours']);

    Route::get('etudiants/{cne}/historique', [DemandeController::class, 'historique']);

    Route::get('/demandes/{id}/document-html', [DemandeController::class, 'documentHtml']);
    Route::get('/demandes/{id}/document-apercu', [DemandeController::class, 'apercuDocument']);
    Route::post('/demandes/{id}/document-pdf', [DemandeController::class, 'enregistrerDocumentPdf']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('dashboard', [AdminController::class, 'dashboard']);
        Route::get('users', [AdminController::class, 'index']);
        Route::post('users', [AdminController::class, 'store']);
        Route::get('users/{id}', [AdminController::class, 'show']);
        Route::put('users/{id}', [AdminController::class, 'update']);
        Route::put('users/{id}/toggle-actif', [AdminController::class, 'toggleActif']);
        Route::delete('users/{id}', [AdminController::class, 'destroy']);
    });
});