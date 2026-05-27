<?php

namespace App\Services\Api;

use App\Models\Anime;
use App\Models\Episode;
use App\Models\Player;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class BotUploaderService
{
    public function getTioActiveAiringAnimes(): Collection
    {
        $data = Cache::tags(['tio-active'])->remember('tio_active_airing_animes', 300, function () {
            return Anime::where('active_tio', 1)
                ->where('status', 1)
                ->with(['episodes' => function ($query) {
                    $query->orderBy('number', 'desc');
                }])
                ->get()
                ->map(function ($anime) {
                    $latestEpisode = $anime->episodes->first();
                    return [
                        'id' => $anime->id,
                        'nombre' => $anime->name,
                        'name' => $anime->name,
                        'nombre_corto' => $anime->short_name,
                        'short_name' => $anime->short_name,
                        'ultimo_episodio' => $latestEpisode ? $latestEpisode->number : null,
                    ];
                })
                ->toArray();
        });

        return collect($data);
    }

    public function uploadEpisodeWithPlayers(array $data): array
    {
        $anime = Anime::find($data['anime_id']);
        if (!$anime) {
            return ['success' => false, 'message' => 'Anime not found'];
        }

        $episode = Episode::firstOrCreate(
            [
                'anime_id' => $anime->id,
                'number' => $data['number']
            ]
        );

        foreach ($data['players'] as $playerData) {
            Player::updateOrCreate(
                [
                    'episode_id' => $episode->id,
                    'server_id' => $playerData['server_id'],
                    'languaje' => $playerData['language']
                ],
                [
                    'code' => $playerData['code'],
                    'updated_at' => now()
                ]
            );
        }

        $tags = ['home', 'calendar', 'anime-detail', 'episode-detail'];
        if ($anime->slug) {
            $tags[] = "anime-{$anime->slug}";
        }
        Cache::tags($tags)->flush();

        return [
            'success' => true,
            'message' => 'Episode and players uploaded successfully',
            'episode_id' => $episode->id
        ];
    }
}
