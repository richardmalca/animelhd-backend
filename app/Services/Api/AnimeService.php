<?php

namespace App\Services\Api;

use App\Models\Anime;
use App\Models\Episode;
use App\Models\Genre;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Redis;

class AnimeService
{
    public function getLatestEpisodes(int $limit = 12): Collection
    {
        $data = Cache::tags(['home'])->remember("latest_episodes_{$limit}", 300, function () use ($limit) {
            // 1. Obtener los IDs de los últimos episodios únicos por anime
            $latestIds = Episode::has('players')
                ->select(DB::raw('MAX(id) as id'))
                ->groupBy('anime_id')
                ->orderBy('id', 'desc')
                ->limit($limit)
                ->pluck('id');

            // 2. Traer la información completa de esos episodios específicos
            return Episode::whereIn('id', $latestIds)
                ->with(['anime:id,name,poster,slug', 'players:id,episode_id,languaje'])
                ->orderBy('id', 'desc')
                ->get(['id', 'anime_id', 'number'])
                ->map(function ($episode) {
                    return [
                        'id' => $episode->id,
                        'number' => $episode->number,
                        'anime_title' => $episode->anime->name,
                        'anime_image' => $episode->anime->poster,
                        'anime_slug' => $episode->anime->slug,
                        'languages' => $episode->players->pluck('languaje')->unique()->map(function ($lang) {
                            return match ($lang) {
                                '0' => 'SUB',
                                '1' => 'LAT',
                                '2' => 'ESP',
                                default => $lang
                            };
                        })->values()->toArray()
                    ];
                })->toArray();
        });

        return collect($data);
    }

    public function getLatestAnimes(int $limit = 14): Collection
    {
        $data = Cache::tags(['home'])->remember("latest_animes_{$limit}", 300, function () use ($limit) {
            return Anime::orderBy('id', 'desc')
                ->limit($limit)
                ->get(['id', 'name', 'slug', 'poster', 'vote_average', 'type'])
                ->toArray();
        });

        return collect($data);
    }

    public function getHeroAnime(): ?Anime
    {
        $heroData = Cache::tags(['home'])->remember('hero_anime_array', 86400, function () {
            $anime = Anime::whereNotNull('banner')
                ->where('vote_average', '>=', 7)
                ->where('views_app', '>', 500)
                ->inRandomOrder()
                ->first(['id', 'name', 'slug', 'overview', 'banner', 'poster', 'vote_average']) 
                ?? Anime::whereNotNull('banner')->orderBy('vote_average', 'desc')->first(['id', 'name', 'slug', 'overview', 'banner', 'poster', 'vote_average']);
            
            return $anime ? $anime->toArray() : null;
        });

        if (!$heroData) return null;

        $anime = new Anime();
        $anime->forceFill($heroData);
        $anime->exists = true;
        return $anime;
    }

    public function getAnimesPaginated(array $filters = [], int $perPage = 24): LengthAwarePaginator
    {
        $page = request('page', 1);
        $perPage = (int) $perPage;
        
        // Si hay cualquier filtro activo, usamos un cache más corto (30 seg) para mayor frescura
        $hasFilters = !empty($filters['search']) || !empty($filters['status']) || !empty($filters['genre']) || !empty($filters['year']) || !empty($filters['type']);
        $cacheTTL = $hasFilters ? 30 : 300;
        
        $cacheKey = 'animes_pagination_' . md5(json_encode($filters) . $page . $perPage);

        $data = Cache::tags(['catalog'])->remember($cacheKey, $cacheTTL, function () use ($filters, $perPage) {
            return Anime::query()
                ->when(!empty($filters['search']), function ($query) use ($filters) {
                    $search = trim($filters['search']);
                    $query->where(function($q) use ($search) {
                        $q->where('name', 'like', '%' . $search . '%')
                          ->orWhere('name_alternative', 'like', '%' . $search . '%');
                    });
                })
                ->when(isset($filters['type']), fn($q) => $q->where('type', $filters['type']))
                ->when(isset($filters['status']), fn($q) => $q->where('status', $filters['status']))
                ->when(!empty($filters['year']), fn($q) => $q->whereYear('aired', $filters['year']))
                ->when(!empty($filters['genre']), function ($query) use ($filters) {
                    $genres = explode(',', $filters['genre']);
                    foreach ($genres as $genre) {
                        $query->where('genres', 'like', '%' . trim($genre) . '%');
                    }
                })
                ->orderBy('id', 'desc')
                ->paginate($perPage, ['id', 'name', 'slug', 'poster', 'vote_average', 'type'])
                ->toArray();
        });

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $data['data'],
            $data['total'],
            $data['per_page'],
            $data['current_page'],
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }

    public function getGenres(): Collection
    {
        return Cache::tags(['catalog'])->remember('anime_genres', 86400, function () {
            return Genre::orderBy('title', 'asc')->get(['id', 'title', 'slug']);
        });
    }

    public function getYears(): Collection
    {
        return Cache::tags(['catalog'])->remember('anime_years', 86400, function () {
            return Anime::whereNotNull('aired')
                ->select(DB::raw('YEAR(aired) as year'))
                ->distinct()
                ->orderBy('year', 'desc')
                ->pluck('year');
        });
    }

    public function getAnimeBySlug(string $slug): ?array
    {
        return Cache::tags(['anime-detail', "anime-{$slug}"])->remember("anime_detail_{$slug}", 3600, function () use ($slug) {
            $anime = Anime::where('slug', $slug)->first();
            if (!$anime) return null;

            $allRelationIds = collect(explode(',', $anime->prequel . ',' . $anime->sequel . ',' . $anime->related))
                ->filter()
                ->unique()
                ->values();

            $relatedAnimes = $allRelationIds->isEmpty() 
                ? collect() 
                : Anime::whereIn('id', $allRelationIds)->get(['id', 'name', 'poster', 'slug', 'type', 'vote_average']);

            $episodes = $anime->episodes()
                ->has('players')
                ->orderBy('number', 'desc')
                ->get(['id', 'number', 'created_at']);

            return [
                'anime' => $anime->toArray(),
                'episodes' => $episodes->toArray(),
                'relations' => [
                    'prequel' => $relatedAnimes->whereIn('id', explode(',', $anime->prequel))->values()->toArray(),
                    'sequel' => $relatedAnimes->whereIn('id', explode(',', $anime->sequel))->values()->toArray(),
                    'related' => $relatedAnimes->whereIn('id', explode(',', $anime->related))->values()->toArray(),
                ]
            ];
        });
    }

    public function getCalendarData(): Collection
    {
        $data = Cache::tags(['calendar'])->remember('anime_calendar', 300, function () {
            return Anime::where('status', 1)
                ->with(['episodes' => function ($query) {
                    $query->has('players')->orderBy('number', 'desc')->select('id', 'anime_id', 'number', 'created_at');
                }])
                ->get(['id', 'name', 'slug', 'poster', 'broadcast', 'vote_average', 'type'])
                ->map(function ($anime) {
                    $latestEpisode = $anime->episodes->first();
                    return [
                        'id' => $anime->id,
                        'name' => $anime->name,
                        'slug' => $anime->slug,
                        'poster' => $anime->poster,
                        'broadcast' => $anime->broadcast,
                        'vote_average' => $anime->vote_average,
                        'type' => $anime->type,
                        'last_episode_number' => $latestEpisode ? $latestEpisode->number : 0,
                        'last_episode_at' => $latestEpisode ? $latestEpisode->created_at : null,
                    ];
                })->toArray();
        });

        return collect($data);
    }

    public function getEpisodeData(string $slug, int $number): ?array
    {
        return Cache::tags(['episode-detail', "anime-{$slug}"])->remember("episode_detail_{$slug}_{$number}", 300, function () use ($slug, $number) {
            $anime = Anime::where('slug', $slug)->first(['id', 'name', 'slug', 'poster', 'banner', 'type', 'vote_average', 'status']);
            if (!$anime) return null;

            $episodes = $anime->episodes()
                ->has('players')
                ->orderBy('number', 'desc')
                ->get(['id', 'anime_id', 'number', 'created_at']);

            $episode = $episodes->firstWhere('number', $number);
            if (!$episode) return null;

            $appUrl = config('app.url');
            $epSlug = "{$anime->slug}-episodio-{$number}";
            $timestamp = time();

            $players = $episode->players()
                ->with('server')
                ->get()
                ->map(function ($player) use ($appUrl, $epSlug, $timestamp) {
                    $data = $player->id . '|' . $timestamp;
                    $token = Crypt::encryptString($data);
                    
                    $lang = (string)$player->languaje;
                    
                    return [
                        'id' => $player->id,
                        'language' => match ($lang) {
                            '0' => 'SUB',
                            '1' => 'LAT',
                            '2' => 'ESP',
                            default => $lang
                        },
                        'server_name' => $player->server->title ?? 'Unknown',
                        'bridge_url' => "{$appUrl}/v/{$epSlug}/" . urlencode($token),
                        'show_desktop' => (bool)($player->server->show_on_web_desktop ?? true),
                        'show_mobile' => (bool)($player->server->show_on_web_mobile ?? true)
                    ];
                });

            if ($players->isEmpty()) return null;

            $next = $episodes->where('number', '>', $number)->sortBy('number')->first();
            $prev = $episodes->where('number', '<', $number)->sortByDesc('number')->first();

            return [
                'anime' => $anime->toArray(),
                'episode' => $episode->toArray(),
                'players' => $players->toArray(),
                'next' => $next ? $next->number : null,
                'prev' => $prev ? $prev->number : null,
                'episodes' => $episodes->map(fn($ep) => ['id' => $ep->id, 'number' => $ep->number])->toArray()
            ];
        });
    }

    public function getLatinosPaginated(int $perPage = 24): LengthAwarePaginator
    {
        $page = request('page', 1);
        $cacheKey = "animes_latinos_{$page}_{$perPage}";

        $data = Cache::tags(['catalog'])->remember($cacheKey, 300, function () use ($perPage) {
            return Anime::whereHas('episodes.players', function ($query) {
                    $query->where('languaje', 1);
                })
                ->with(['episodes' => function ($query) {
                    $query->has('players')->orderBy('number', 'desc')->select('id', 'anime_id', 'number', 'created_at');
                }])
                ->orderBy('id', 'desc')
                ->paginate($perPage, ['id', 'name', 'slug', 'poster', 'vote_average', 'type'])
                ->toArray();
        });

        $mappedData = collect($data['data'])->map(function ($anime) {
            $episodes = collect($anime['episodes'] ?? []);
            $latest = $episodes->first();
            
            return [
                'id' => $anime['id'],
                'name' => $anime['name'],
                'slug' => $anime['slug'],
                'poster' => $anime['poster'],
                'vote_average' => $anime['vote_average'],
                'type' => $anime['type'],
                'last_episode_number' => $latest ? $latest['number'] : 0,
                'last_episode_at' => $latest ? $latest['created_at'] : null,
            ];
        });

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $mappedData->toArray(),
            $data['total'],
            $data['per_page'],
            $data['current_page'],
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }

    public function getCastellanosPaginated(int $perPage = 24): LengthAwarePaginator
    {
        $page = request('page', 1);
        $cacheKey = "animes_castellanos_{$page}_{$perPage}";

        $data = Cache::tags(['catalog'])->remember($cacheKey, 300, function () use ($perPage) {
            return Anime::whereHas('episodes.players', function ($query) {
                    $query->where('languaje', 2);
                })
                ->with(['episodes' => function ($query) {
                    $query->has('players')->orderBy('number', 'desc')->select('id', 'anime_id', 'number', 'created_at');
                }])
                ->orderBy('id', 'desc')
                ->paginate($perPage, ['id', 'name', 'slug', 'poster', 'vote_average', 'type'])
                ->toArray();
        });

        $mappedData = collect($data['data'])->map(function ($anime) {
            $episodes = collect($anime['episodes'] ?? []);
            $latest = $episodes->first();
            
            return [
                'id' => $anime['id'],
                'name' => $anime['name'],
                'slug' => $anime['slug'],
                'poster' => $anime['poster'],
                'vote_average' => $anime['vote_average'],
                'type' => $anime['type'],
                'last_episode_number' => $latest ? $latest['number'] : 0,
                'last_episode_at' => $latest ? $latest['created_at'] : null,
            ];
        });

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $mappedData->toArray(),
            $data['total'],
            $data['per_page'],
            $data['current_page'],
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }
}
