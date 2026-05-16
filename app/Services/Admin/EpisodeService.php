<?php

namespace App\Services\Admin;

use App\Models\Episode;
use App\Models\Anime;
use App\Models\Player;
use App\Models\Server;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class EpisodeService
{
    public function getEpisodes(): LengthAwarePaginator
    {
        return Episode::with('anime')
            ->orderBy('id', 'desc')
            ->paginate(10);
    }

    public function createEpisode(array $data): Episode
    {
        $episode = Episode::create($data);
        $anime = Anime::find($data['anime_id']);
        $this->clearCache($anime->slug ?? null);
        return $episode;
    }

    public function updateEpisode(Episode $episode, array $data): bool
    {
        $updated = $episode->update($data);
        $anime = Anime::find($data['anime_id'] ?? $episode->anime_id);
        $this->clearCache($anime->slug ?? null);
        return $updated;
    }

    public function deleteEpisode(Episode $episode): bool
    {
        $animeSlug = $episode->anime->slug ?? null;
        $deleted = $episode->delete();
        $this->clearCache($animeSlug);
        return $deleted;
    }

    public function clearCache(?string $slug = null): void
    {
        $tags = ['home', 'calendar', 'anime-detail', 'episode-detail'];
        if ($slug) {
            $tags[] = "anime-{$slug}";
        }
        Cache::tags($tags)->flush();
    }

    public function bulkSync(Anime $anime, int $count): void
    {
        for ($i = 1; $i <= $count; $i++) {
            Episode::updateOrCreate(
                [
                    'anime_id' => $anime->id,
                    'number' => $i
                ],
                [
                    // Aquí podrías añadir más campos por defecto si fuera necesario
                    'updated_at' => now()
                ]
            );
        }
        $this->clearCache($anime->slug);
    }

    public function bulkImportWithPlayers(Anime $anime, array $data): void
    {
        $startNumber = (int)($data['start_number'] ?? 1);
        $playerLines = explode("\n", str_replace("\r", "", $data['players']));
        $playerLines = array_map('trim', $playerLines);
        $playerLines = array_filter($playerLines); // Remove empty lines

        // Obtener todos los servidores activos para detección de dominio
        $servers = Server::where('status', 1)->get();

        foreach (array_values($playerLines) as $index => $playerUrl) {
            $episodeNumber = $startNumber + $index;

            // 1. Asegurar que el episodio existe
            $episode = Episode::updateOrCreate(
                [
                    'anime_id' => $anime->id,
                    'number' => $episodeNumber
                ],
                [
                    'updated_at' => now()
                ]
            );

            // 2. Detectar servidor por dominio
            $detectedServer = null;
            try {
                $host = parse_url($playerUrl, PHP_URL_HOST);
                if ($host) {
                    $detectedServer = $servers->first(function ($server) use ($host) {
                        $domains = is_array($server->domains) ? $server->domains : json_decode($server->domains, true) ?? [];
                        foreach ($domains as $domain) {
                            if (stripos($host, $domain) !== false) return true;
                        }
                        return false;
                    });
                }
            } catch (\Exception $e) {
                $detectedServer = $servers->first(function ($server) use ($playerUrl) {
                    $domains = is_array($server->domains) ? $server->domains : json_decode($server->domains, true) ?? [];
                    foreach ($domains as $domain) {
                        if (stripos($playerUrl, $domain) !== false) return true;
                    }
                    return false;
                });
            }

            // 3. Si se detectó servidor, crear/actualizar el player
            if ($detectedServer && $playerUrl) {
                // Extraer el ID de la URL
                $code = $this->extractPlayerId($playerUrl);

                Player::updateOrCreate(
                    [
                        'episode_id' => $episode->id,
                        'server_id' => $detectedServer->id,
                        'languaje' => $data['languaje'] ?? 0
                    ],
                    [
                        'code' => $code,
                        'updated_at' => now()
                    ]
                );
            }
        }
        $this->clearCache($anime->slug);
    }

    private function extractPlayerId(string $url): string
    {
        if (!str_starts_with($url, 'http')) {
            return $url;
        }

        $path = parse_url($url, PHP_URL_PATH);
        if (!$path) return $url;

        $parts = explode('/', trim($path, '/'));
        
        // Caso especial para rutas como /e/ID, /d/ID, /v/ID
        if (count($parts) >= 2 && in_array($parts[0], ['e', 'd', 'v', 'f', 'embed'])) {
            return $parts[1];
        }

        // Si tiene múltiples partes, devolvemos la primera que parezca un ID (alfanumérico largo)
        // O simplemente la última parte que no sea "video.mp4" etc.
        $lastPart = end($parts);
        if (str_contains($lastPart, '.')) {
            // Si es algo como video.mp4, tomamos la anterior
            return count($parts) > 1 ? $parts[count($parts) - 2] : $lastPart;
        }

        return $lastPart;
    }
}
