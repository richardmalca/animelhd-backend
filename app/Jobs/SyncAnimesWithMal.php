<?php

namespace App\Jobs;

use App\Models\Anime;
use App\Services\Admin\AnimeService;
use App\Services\Admin\MalService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncAnimesWithMal implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 3600; // 1 hora de tiempo límite para el job

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(AnimeService $animeService, MalService $malService): void
    {
        $animes = Anime::whereNotNull('mal_id')->get();
        $total = $animes->count();
        
        Log::info("Iniciando sincronización masiva con MAL para {$total} animes.");

        foreach ($animes as $index => $anime) {
            try {
                $malData = $malService->getDetails($anime->mal_id);
                if ($malData) {
                    $animeService->updateFromMalData($anime, $malData);
                }
                
                // Pequeño retardo para no saturar la API de MAL (Rate Limit)
                usleep(500000); // 0.5 segundos

                if (($index + 1) % 50 === 0) {
                    Log::info("Sincronización en progreso: " . ($index + 1) . "/{$total}");
                }
            } catch (\Exception $e) {
                Log::error("Error sincronizando anime ID {$anime->id} ({$anime->name}): " . $e->getMessage());
            }
        }

        Log::info("Sincronización masiva con MAL completada.");
    }
}
