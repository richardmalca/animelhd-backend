<?php

namespace App\Services\Api;

use App\Models\Anime;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DubbedAnimeCatalog
{
    public function paginate(int $language, int $perPage = 28): LengthAwarePaginator
    {
        $page = max(1, (int) request('page', 1));
        $key = "dubbed_animes_v2_{$language}_{$page}_{$perPage}";
        // Existing episode/player writes already invalidate episode-detail.
        $data = Cache::tags(['catalog', 'episode-detail'])->remember($key, 300, function () use ($language, $perPage, $page) {
            // Cache the compact ranking once, rather than aggregate the full
            // catalog twice for every page (pagination count + page query).
            $rankedIds = Cache::tags(['catalog', 'episode-detail'])->remember("dubbed_anime_order_v2_{$language}", 300, function () use ($language) {
                $latestPlayers = DB::table('players')
                    ->where('languaje', (string) $language)
                    ->groupBy('episode_id')
                    ->selectRaw('episode_id, MAX(id) AS latest_player_id');

                return DB::query()->fromSub($latestPlayers, 'dubbed_players')
                    ->join('episodes', 'episodes.id', '=', 'dubbed_players.episode_id')
                    ->join('animes', 'animes.id', '=', 'episodes.anime_id')
                    ->groupBy('episodes.anime_id')
                    ->orderByRaw('MAX(dubbed_players.latest_player_id) DESC')
                    ->orderByDesc('episodes.anime_id')
                    ->pluck('episodes.anime_id')->all();
            });
            $pageIds = array_slice($rankedIds, ($page - 1) * $perPage, $perPage);
            $rows = [];

            if ($pageIds !== []) {
                $animes = Anime::whereIn('id', $pageIds)
                    ->get(['id', 'name', 'slug', 'poster', 'vote_average', 'type', 'aired'])
                    ->keyBy('id');
                // Count only this page's episodes; multiple servers count once.
                $stats = DB::table('episodes')
                    ->join('players', 'players.episode_id', '=', 'episodes.id')
                    ->whereIn('episodes.anime_id', $pageIds)
                    ->where('players.languaje', (string) $language)
                    ->groupBy('episodes.anime_id')
                    ->selectRaw('episodes.anime_id, COUNT(DISTINCT episodes.id) AS episode_count,
                        MAX(episodes.number) AS last_episode_number,
                        MAX(players.created_at) AS last_episode_at')
                    ->get()->keyBy('anime_id');

                foreach ($pageIds as $id) {
                    if (isset($animes[$id], $stats[$id])) {
                        $rows[] = array_merge($animes[$id]->toArray(), [
                            'episode_count' => (int) $stats[$id]->episode_count,
                            'last_episode_number' => (int) $stats[$id]->last_episode_number,
                            'last_episode_at' => $stats[$id]->last_episode_at,
                        ]);
                    }
                }
            }

            return ['data' => $rows, 'total' => count($rankedIds), 'per_page' => $perPage, 'current_page' => $page];
        });

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $data['data'], $data['total'], $data['per_page'], $data['current_page'],
            ['path' => request()->url(), 'query' => request()->query()],
        );
    }
}
