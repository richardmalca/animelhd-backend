<?php

namespace App\Services\Api;

use App\Models\Anime;
use Illuminate\Support\Facades\Cache;

class AnimeSyncService
{
    private const VERSION_TTL = 30;

    private const PAYLOAD_TTL = 86400;

    public function getVersion(): array
    {
        return Cache::remember('sync:animes:version', self::VERSION_TTL, function () {
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
        $cacheKey = "sync:animes:payload:{$version}";

        return Cache::remember($cacheKey, self::PAYLOAD_TTL, function () {
            return Anime::query()
                ->select(['id', 'mal_id'])
                ->orderBy('id')
                ->get()
                ->map(fn (Anime $anime) => [
                    'id' => $anime->id,
                    'mal_id' => $anime->mal_id,
                ])
                ->toArray();
        });
    }
}
