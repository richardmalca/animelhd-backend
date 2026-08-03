<?php

use App\Http\Controllers\Admin\AnimeController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SettingsController;

use App\Http\Controllers\Admin\EpisodeController;
use App\Http\Controllers\Admin\GenreController;
use App\Http\Controllers\Admin\PlayerController;
use App\Http\Controllers\Admin\ServerController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('admin.animes.index');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin', [DashboardController::class, 'index'])->name('admin');
    Route::post('admin/cache/flush', [DashboardController::class, 'flushCache'])->name('admin.cache.flush');

    Route::prefix('admin/animes')->group(function () {
        Route::get('import', [AnimeController::class, 'import'])->name('admin.animes.import');
        Route::post('import', [AnimeController::class, 'storeFromTmdb'])->name('admin.animes.import.store');
        Route::get('tmdb-search', [AnimeController::class, 'tmdbSearch'])->name('admin.animes.tmdb-search');
        Route::get('mal-search', [AnimeController::class, 'malSearch'])->name('admin.animes.mal-search');
        Route::get('mal-details/{malId}', [AnimeController::class, 'malDetails'])->name('admin.animes.mal-details');
        Route::post('sync/{anime}', [AnimeController::class, 'sync'])->name('admin.animes.sync');
        Route::post('mal-sync/{anime}', [AnimeController::class, 'malSync'])->name('admin.animes.mal-sync');
        Route::post('check-slug', [AnimeController::class, 'checkSlug'])->name('admin.animes.check-slug');
        Route::get('sync-progress', [AnimeController::class, 'syncProgress'])->name('admin.animes.sync-progress');
        Route::post('sync-stop', [AnimeController::class, 'stopSync'])->name('admin.animes.sync-stop');
        Route::post('sync-all', [AnimeController::class, 'syncAllMal'])->name('admin.animes.sync-all');
        Route::get('{anime}/episodes/import', [EpisodeController::class, 'importForm'])->name('admin.episodes.import');
        Route::post('{anime}/episodes/import', [EpisodeController::class, 'importStore'])->name('admin.episodes.import.store');
        Route::get('{anime}/episodes', [EpisodeController::class, 'animeEpisodes'])->name('admin.animes.episodes');
        Route::get('{anime}/episodes/{episode}/players', [PlayerController::class, 'index'])->name('admin.players.index');
        Route::post('{anime}/episodes/{episode}/players', [PlayerController::class, 'store'])->name('admin.players.store');
        Route::put('{anime}/episodes/{episode}/players/{player}', [PlayerController::class, 'update'])->name('admin.players.update');
        Route::delete('{anime}/episodes/{episode}/players/{player}', [PlayerController::class, 'destroy'])->name('admin.players.destroy');
    });
    Route::resource('admin/animes', AnimeController::class)->names('admin.animes')->except(['show', 'create', 'store']);
    
    Route::post('admin/animes/{anime}/episodes/bulk-sync', [EpisodeController::class, 'bulkSync'])->name('admin.episodes.bulk-sync');
    Route::resource('admin/episodes', EpisodeController::class)->names('admin.episodes')->except(['show', 'create', 'edit']);
    
    Route::get('admin/settings', [SettingsController::class, 'index'])->name('admin.settings');
    Route::post('admin/settings', [SettingsController::class, 'update'])->name('admin.settings.update');
    
    Route::resource('admin/genres', GenreController::class)->names('admin.genres')->except(['show', 'create', 'edit']);

    Route::resource('admin/servers', ServerController::class)->except(['create', 'show', 'edit']);
    Route::post('admin/users/{user}/toggle-premium', [UserController::class, 'togglePremium'])->name('admin.users.toggle-premium');
    Route::post('admin/users/{user}/update-password', [UserController::class, 'updatePassword'])->name('admin.users.update-password');
    Route::post('admin/users/{user}/update-email', [UserController::class, 'updateEmail'])->name('admin.users.update-email');
    Route::resource('admin/users', UserController::class)->only(['index']);
});

Route::get('/v/{slug}/{token?}', [\App\Http\Controllers\PlayerController::class, 'show'])->name('player.bridge');

require __DIR__.'/settings.php';
