<?php

namespace App\Services\Sync;

use App\Models\Anime;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\Player;
use App\Models\Server;
use App\Models\SyncChange;
use App\Services\Api\AnimeSyncService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Arma cada página de GET /api/sync: lo que cambió desde un cursor, más los ids que ya no existen.
 */
class SyncService
{
    /** Ids por consulta, para no pasarse del límite de variables de algunas bases. */
    private const LOAD_CHUNK = 2000;

    private const SERVER_FIELDS = [
        'id', 'title', 'embed', 'type', 'status', 'position',
        'show_on_app', 'show_on_web_desktop', 'show_on_web_mobile',
    ];

    /**
     * @return array<string, mixed>
     */
    public function page(int $cursor, int $limit): array
    {
        // La app debe empezar de cero (`reset`) si su cursor ya no corresponde a este registro:
        // es más alto que cualquier cambio, o es anterior a la última reconstrucción.
        $latest = (int) SyncChange::max('id');
        $rebuiltAt = (int) SyncChange::where('entity', SyncChangeRecorder::RESET)->value('id');
        $reset = $cursor > $latest || ($cursor > 0 && $cursor < $rebuiltAt);
        if ($reset) {
            $cursor = 0;
        }

        $rows = SyncChange::query()
            ->where('entity', '!=', SyncChangeRecorder::RESET)
            ->where('id', '>', $cursor)
            ->where('created_at', '<=', now()->subSeconds((int) config('sync.settle_seconds')))
            ->orderBy('id')
            ->limit($limit + 1)
            ->get(['id', 'entity', 'entity_id', 'deleted']);

        $hasMore = $rows->count() > $limit;
        $rows = $rows->take($limit);

        $upserts = [];
        $deletions = [];
        foreach ($rows as $row) {
            if ($row->deleted) {
                $deletions[$row->entity][] = $row->entity_id;
            } else {
                $upserts[$row->entity][] = $row->entity_id;
            }
        }

        $animes = $this->load(Anime::query(), $upserts[SyncChangeRecorder::ANIME] ?? [], AnimeSyncService::FIELDS);
        $genres = $this->load(Genre::query(), $upserts[SyncChangeRecorder::GENRE] ?? [], ['id', 'title', 'slug']);
        $servers = $this->load(Server::query(), $upserts[SyncChangeRecorder::SERVER] ?? [], self::SERVER_FIELDS);
        $episodes = $this->load(Episode::query(), $upserts[SyncChangeRecorder::EPISODE] ?? [], ['id', 'anime_id', 'number', 'created_at']);
        $players = $this->load(Player::query(), $upserts[SyncChangeRecorder::PLAYER] ?? [], ['id', 'episode_id', 'server_id', 'languaje', 'code', 'code_backup']);

        return [
            'cursor' => $rows->isEmpty() ? $cursor : (int) $rows->last()->id,
            'has_more' => $hasMore,
            'reset' => $reset,
            'animes' => $animes->values()->map(fn ($model) => $model->toArray())->all(),
            'genres' => $genres->values()->map(fn ($model) => $model->toArray())->all(),
            'servers' => $servers->values()->map(fn ($model) => $model->toArray())->all(),
            'episodes' => $episodes->values()->map(fn ($model) => [
                'id' => $model->id,
                'anime_id' => $model->anime_id,
                'number' => self::episodeNumber($model->number),
                'created_at' => $model->created_at?->toISOString(),
            ])->all(),
            'players' => $players->values()->map(fn ($model) => [
                'id' => $model->id,
                'episode_id' => $model->episode_id,
                'server_id' => $model->server_id,
                'language' => self::language($model->languaje),
                'code' => $model->code,
                'code_backup' => $model->code_backup,
            ])->all(),
            'deleted' => [
                'animes' => $this->deletedIds(SyncChangeRecorder::ANIME, $deletions, $upserts, $animes),
                'genres' => $this->deletedIds(SyncChangeRecorder::GENRE, $deletions, $upserts, $genres),
                'servers' => $this->deletedIds(SyncChangeRecorder::SERVER, $deletions, $upserts, $servers),
                'episodes' => $this->deletedIds(SyncChangeRecorder::EPISODE, $deletions, $upserts, $episodes),
                'players' => $this->deletedIds(SyncChangeRecorder::PLAYER, $deletions, $upserts, $players),
            ],
        ];
    }

    /**
     * Número de episodio: entero cuando es exacto ("3.00" => 3) y decimal solo cuando hace falta (12.5).
     * Así la app recibe siempre un número JSON, aunque la columna sea decimal.
     */
    public static function episodeNumber(mixed $value): int|float
    {
        $number = (float) $value;

        return floor($number) === $number ? (int) $number : $number;
    }

    /**
     * Idioma como en el resto de la API: SUB, LAT o ESP (cualquier otro valor se deja tal cual).
     */
    public static function language(mixed $value): string
    {
        return match ((string) $value) {
            '0' => 'SUB',
            '1' => 'LAT',
            '2' => 'ESP',
            default => (string) $value,
        };
    }

    /**
     * @param  Builder<Model>  $query
     * @param  array<int>  $ids
     * @param  array<string>  $columns
     * @return Collection<int, Model>
     */
    private function load(Builder $query, array $ids, array $columns): Collection
    {
        if ($ids === []) {
            return collect();
        }

        $loaded = collect();
        foreach (array_chunk($ids, self::LOAD_CHUNK) as $chunk) {
            $loaded = $loaded->concat((clone $query)->whereIn('id', $chunk)->get($columns));
        }

        return $loaded->sortBy('id')->keyBy('id');
    }

    /**
     * Ids borrados según el registro, más los que el registro daba por vigentes pero ya no existen
     * (por ejemplo, borrados a mano en la base sin pasar por Eloquent).
     *
     * @param  array<string, array<int>>  $deletions
     * @param  array<string, array<int>>  $upserts
     * @return array<int>
     */
    private function deletedIds(string $entity, array $deletions, array $upserts, Collection $loaded): array
    {
        $missing = array_diff($upserts[$entity] ?? [], $loaded->keys()->all());

        return collect($deletions[$entity] ?? [])->merge($missing)->unique()->sort()->values()->all();
    }
}
