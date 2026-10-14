<?php

namespace App\Providers;

use App\Models\Anime;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\Player;
use App\Models\Server;
use App\Observers\AnimeSyncObserver;
use App\Observers\EpisodeSyncObserver;
use App\Observers\GenreSyncObserver;
use App\Observers\PlayerSyncObserver;
use App\Observers\ServerSyncObserver;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerSyncObservers();
    }

    /**
     * Cada cambio en estos modelos se anota en `sync_changes` para GET /api/sync.
     */
    protected function registerSyncObservers(): void
    {
        Anime::observe(AnimeSyncObserver::class);
        Genre::observe(GenreSyncObserver::class);
        Server::observe(ServerSyncObserver::class);
        Episode::observe(EpisodeSyncObserver::class);
        Player::observe(PlayerSyncObserver::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
