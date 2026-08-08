<?php

namespace App\Services\Admin;

use App\Services\SettingsService;
use Illuminate\Support\Facades\Http;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class TmdbService
{
    protected string $baseUrl = 'https://api.themoviedb.org/3';

    public function __construct(protected SettingsService $settingsService)
    {
    }

    public function getApiKey(): ?string
    {
        return $this->settingsService->get('tmdb_api_key');
    }

    public function search(string $query)
    {
        $apiKey = $this->getApiKey();
        if (!$apiKey) {
            throw new \Exception('TMDB API Key no configurada');
        }

        return Cache::remember("tmdb:search:" . md5($query), 86400, function () use ($apiKey, $query) {
            $response = Http::get("{$this->baseUrl}/search/multi", [
                'api_key' => $apiKey,
                'query' => $query,
                'language' => 'es-ES',
            ]);

            if (!$response->successful()) {
                throw new \Exception('Error al conectar con TMDB');
            }

            return $response->json();
        });
    }

    public function getDetails(int $tmdbId, string $type)
    {
        $apiKey = $this->getApiKey();
        if (!$apiKey) {
            throw new \Exception('TMDB API Key no configurada');
        }

        return Cache::remember("tmdb:details:{$type}:{$tmdbId}", 604800, function () use ($apiKey, $tmdbId, $type) {
            $response = Http::get("{$this->baseUrl}/{$type}/{$tmdbId}", [
                'api_key' => $apiKey,
                'language' => 'es-ES',
            ]);

            if (!$response->successful()) {
                throw new \Exception('No se pudo obtener la información de TMDB');
            }

            return $response->json();
        });
    }
}
