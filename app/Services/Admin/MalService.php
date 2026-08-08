<?php

namespace App\Services\Admin;

use App\Services\SettingsService;
use Illuminate\Support\Facades\Http;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class MalService
{
    protected string $baseUrl = 'https://api.myanimelist.net/v2';

    public function __construct(protected SettingsService $settingsService)
    {
    }

    public function getClientId(): ?string
    {
        return $this->settingsService->get('mal_client_id');
    }

    public function search(string $query)
    {
        $clientId = $this->getClientId();
        if (!$clientId) {
            throw new \Exception('MyAnimeList Client ID no configurado');
        }

        return Cache::remember("mal:search:" . md5($query), 86400, function () use ($clientId, $query) {
            $response = Http::withHeaders(['X-MAL-CLIENT-ID' => $clientId])
                ->get("{$this->baseUrl}/anime", [
                    'q' => $query,
                    'limit' => 10,
                    'fields' => 'id,title,main_picture,alternative_titles,synopsis,mean,status,num_episodes,start_season,genres,rating,broadcast'
                ]);

            if (!$response->successful()) {
                throw new \Exception('Error al conectar con MyAnimeList');
            }

            return $response->json();
        });
    }

    public function getDetails(int $malId)
    {
        $clientId = $this->getClientId();
        if (!$clientId) {
            throw new \Exception('MyAnimeList Client ID no configurado');
        }

        return Cache::remember("mal:details:{$malId}", 604800, function () use ($clientId, $malId) {
            $response = Http::withHeaders(['X-MAL-CLIENT-ID' => $clientId])
                ->get("{$this->baseUrl}/anime/{$malId}", [
                    'fields' => 'id,title,main_picture,alternative_titles,synopsis,mean,status,num_episodes,start_season,genres,rating,broadcast,popularity,num_scoring_users'
                ]);

            if (!$response->successful()) {
                throw new \Exception('No se pudo obtener la información de MyAnimeList');
            }

            return $response->json();
        });
    }
}
