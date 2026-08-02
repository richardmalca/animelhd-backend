<?php

namespace App\Services\Api;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class ViewCounterService
{
    private const ANIME_KEY = 'anime_views';
    private const EPISODE_KEY = 'episode_views';

    public function incrementAnime(int $id): void
    {
        Redis::hincrby(self::ANIME_KEY, $id, 1);
    }

    public function incrementEpisode(int $id): void
    {
        Redis::hincrby(self::EPISODE_KEY, $id, 1);
    }

    public function flush(): void
    {
        $this->flushHash(self::ANIME_KEY, 'animes');
        $this->flushHash(self::EPISODE_KEY, 'episodes');
    }

    private function flushHash(string $key, string $table): void
    {
        $counts = Redis::hgetall($key);

        if (empty($counts)) {
            return;
        }

        Redis::del($key);

        foreach ($counts as $id => $count) {
            $count = (int) $count;

            if ($count <= 0) {
                continue;
            }

            DB::table($table)->where('id', (int) $id)->increment('views', $count);
        }
    }
}
