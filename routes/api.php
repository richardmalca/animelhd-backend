<?php

use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\AnimeController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/validate-reset-token', [AuthController::class, 'validateResetToken']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('throttle:api')->group(function () {
    Route::get('/home', [HomeController::class, 'index']);
    Route::get('/animes', [AnimeController::class, 'index']);
    Route::get('/animes/{slug}', [AnimeController::class, 'show']);
    Route::get('/animes/{slug}/episodes/{number}', [AnimeController::class, 'episode']);
    Route::get('/genres', [AnimeController::class, 'genres']);
    Route::get('/years', [AnimeController::class, 'years']);
    Route::get('/calendar', [CalendarController::class, 'index']);
    Route::get('/latinos', [AnimeController::class, 'latinos']);
    Route::get('/castellanos', [AnimeController::class, 'castellanos']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
