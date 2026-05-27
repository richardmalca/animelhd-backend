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
        return Anime::where('active_tio', 1)
            ->where('status', 1)
            ->select('id', 'name', 'short_name', 'slug_tio')
            ->addSelect([
                'last_episode' => Episode::select('number')
                    ->whereColumn('anime_id', 'animes.id')
                    ->orderBy('number', 'desc')
                    ->limit(1)
            ])
            ->get();
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
