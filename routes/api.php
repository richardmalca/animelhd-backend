<?php

use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\AnimeController;
use App\Http\Controllers\Api\AnimeSyncController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BotUploaderController;
use App\Http\Middleware\CheckAppKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware([CheckAppKey::class])->group(function () {
    Route::prefix('bot-uploader')->group(function () {
        Route::get('/list', [BotUploaderController::class, 'list']);
        Route::post('/insert', [BotUploaderController::class, 'insert']);
    });

    Route::middleware(['throttle:5,1', 'referer.whitelist:auth_api'])->group(function () {
        Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/auth/validate-reset-token', [AuthController::class, 'validateResetToken']);
        Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
    });

    Route::get('/home', [HomeController::class, 'index']);
    Route::get('/animes', [AnimeController::class, 'index']);
    Route::get('/animes/{slug}', [AnimeController::class, 'show']);
    Route::get('/animes/{slug}/episodes/{number}', [AnimeController::class, 'episode']);
    Route::get('/genres', [AnimeController::class, 'genres']);
    Route::get('/years', [AnimeController::class, 'years']);
    Route::get('/calendar', [CalendarController::class, 'index']);
    Route::get('/latinos', [AnimeController::class, 'latinos']);
    Route::get('/castellanos', [AnimeController::class, 'castellanos']);

    Route::middleware('throttle:60,1')->prefix('sync')->group(function () {
        Route::get('/animes/version', [AnimeSyncController::class, 'version']);
        Route::get('/animes', [AnimeSyncController::class, 'index']);
    });

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
});
