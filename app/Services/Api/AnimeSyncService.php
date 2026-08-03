<?php

namespace App\Services\Api;

use App\Models\Anime;
use Illuminate\Support\Facades\Cache;

class AnimeSyncService
{
    private const VERSION_TTL = 30;

    private const PAYLOAD_TTL = 86400;

    // Se incrementa cuando cambian los campos que devuelve el payload,
    // para invalidar automáticamente el caché sin esperar a que cambie un anime.
    private const SCHEMA_VERSION = 4;

    private const FIELDS = [
        'id',
        'name',
        'name_alternative',
        'slug',
        'overview',
        'poster',
        'banner',
        'aired',
        'type',
        'status',
        'premiered',
        'broadcast',
        'genres',
        'vote_average',
        'prequel',
        'sequel',
        'related',
        'views_app',
        'mal_id',
        'anilist_id',
        'tmdb_id',
        'rating',
        'popularity',
        'trailer',
    ];

    public function getVersion(): array
    {
        return Cache::remember('sync:animes:version:v' . self::SCHEMA_VERSION, self::VERSION_TTL, function () {
            $maxUpdatedAt = Anime::max('updated_at');
            $count = Anime::count();

            return [
                'version' => $maxUpdatedAt ? "{$maxUpdatedAt}-{$count}" : "empty-{$count}",
                'count' => $count,
            ];
        });
    }

    public function getAnimeList(): array
    {
        $version = $this->getVersion()['version'];
        $cacheKey = 'sync:animes:payload:v' . self::SCHEMA_VERSION . ":{$version}";

        return Cache::remember($cacheKey, self::PAYLOAD_TTL, function () {
            return Anime::query()
                ->select(self::FIELDS)
                ->orderBy('id')
                ->get()
                ->toArray();
        });
    }
}
