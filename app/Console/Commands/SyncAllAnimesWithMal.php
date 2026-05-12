<?php

namespace App\Console\Commands;

use App\Models\Anime;
use App\Services\Admin\MalService;
use App\Services\Admin\AnimeService;
use Illuminate\Console\Command;

class SyncAllAnimesWithMal extends Command
{
    protected $signature = 'anime:sync-all-mal {--delay=1 : Delay in seconds between requests to avoid rate limits}';
    protected $description = 'Sincroniza todos los animes con MyAnimeList para actualizar votos, clasificaciones y estados';

    public function handle(MalService $malService, AnimeService $animeService)
    {
        $total = Anime::whereNotNull('mal_id')->count();

        if ($total === 0) {
            $this->info('No hay animes con ID de MyAnimeList para sincronizar.');
            return 0;
        }

        $this->info("Iniciando sincronización de {$total} animes...");
        $bar = $this->output->createProgressBar($total);
        $delay = (int) $this->option('delay') * 1000000; // Convertir a microsegundos

        // Usamos cursor para no cargar todo en memoria si la lista es gigante
        foreach (Anime::whereNotNull('mal_id')->cursor() as $anime) {
            if (\Illuminate\Support\Facades\Cache::has('anime_sync_stop')) {
                $this->warn("\nSincronización detenida por el usuario.");
                \Illuminate\Support\Facades\Cache::forget('anime_sync_stop');
                break;
            }

            try {
                $progressData = [
                    'current' => $bar->getProgress() + 1,
                    'total' => $total,
                    'last_anime' => $anime->name,
                    'active' => true
                ];

                \Illuminate\Support\Facades\Cache::put('anime_sync_progress', $progressData, 3600);

                $data = $malService->getDetails($anime->mal_id);
                if ($data) {
                    $animeService->updateFromMalData($anime, $data);
                }
                
                $bar->advance();
                
                if ($delay > 0) {
                    usleep($delay);
                }
            } catch (\Exception $e) {
                $this->error("\nError sincronizando {$anime->name} (ID MAL: {$anime->mal_id}): " . $e->getMessage());
                continue;
            }
        }

        \Illuminate\Support\Facades\Cache::forget('anime_sync_progress');
        // event(new \App\Events\AnimeSyncProgressUpdated(0, 0, '', false));
        $bar->finish();
        $this->newLine(2);
        $this->info('Sincronización masiva completada con éxito.');

        return 0;
    }
}
