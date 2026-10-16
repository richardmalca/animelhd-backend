<?php

namespace App\Services\Sync;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Pone al día `sync_changes` con lo que otras aplicaciones escriben en la misma base de datos.
 *
 * Los observers de Eloquent solo anotan lo que se guarda desde esta app. Lo que entra por otra aplicación
 * (la API, el admin, un script) queda en las tablas pero no en el registro, y `/api/sync` no lo ve. Esta clase
 * compara las tablas con el registro y anota lo que falta, sin tocar a las demás aplicaciones.
 *
 * Es barata para poder correr a menudo:
 *  - lo nuevo se busca solo por encima del id más alto ya registrado (índice de la llave primaria);
 *  - lo modificado se busca solo desde la última pasada (índice de `updated_at`) y solo cuenta si cambió
 *    después de que se anotó, para no volver a mandar lo que las apps ya tienen;
 *  - lo borrado y los huecos piden cruzar las tablas completas, así que van aparte, cada tanto.
 */
class SyncReconciler
{
    private const QUICK_AT = 'sync:reconcile:quick_at';

    private const FULL_AT = 'sync:reconcile:full_at';

    private const SINCE = 'sync:reconcile:since';

    /** Segundos que se retroceden al buscar modificados, por si una escritura confirmó tarde. */
    private const MARGIN = 120;

    public function __construct(private readonly SyncChangeRecorder $recorder) {}

    /**
     * Se llama al servir `/api/sync`: pone al día el registro como mucho una vez por intervalo. Un candado evita
     * que dos peticiones lo hagan a la vez. Nunca rompe la sincronización: si algo falla, se reporta y sigue.
     */
    public function reconcileIfDue(): void
    {
        $interval = (int) config('sync.reconcile_interval');
        if ($interval <= 0 || ! $this->isDue(self::QUICK_AT, $interval)) {
            return;
        }

        try {
            Cache::lock('sync:reconcile', 60)->get(function () use ($interval) {
                if (! $this->isDue(self::QUICK_AT, $interval)) {
                    return;
                }

                $full = $this->isDue(self::FULL_AT, (int) config('sync.reconcile_full_interval'));
                $this->reconcile($full);
            });
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * @return array<string, array{new: int, updated: int, gaps: int, deleted: int}>
     */
    public function reconcile(bool $full = false): array
    {
        $startedAt = now();
        $since = $this->since();
        $summary = [];

        foreach (SyncChangeRecorder::TABLES as $entity => $table) {
            $summary[$entity] = [
                'new' => $this->recordNew($entity, $table),
                'updated' => $this->recordUpdated($entity, $table, $since),
                'gaps' => 0,
                'deleted' => 0,
            ];

            if ($full) {
                $summary[$entity]['gaps'] = $this->recordGaps($entity, $table);
                $summary[$entity]['deleted'] = $this->recordDeleted($entity, $table);
            }
        }

        Cache::forever(self::SINCE, $startedAt->subSeconds(self::MARGIN)->toDateTimeString());
        Cache::forever(self::QUICK_AT, $startedAt->getTimestamp());
        if ($full) {
            Cache::forever(self::FULL_AT, $startedAt->getTimestamp());
        }

        return $summary;
    }

    /** Filas con un id más alto que el último registrado: lo que se creó fuera de esta app. */
    private function recordNew(string $entity, string $table): int
    {
        $last = (int) DB::table('sync_changes')->where('entity', $entity)->max('entity_id');
        $ids = DB::table($table)->where('id', '>', $last)->orderBy('id')->pluck('id')->all();
        $this->recorder->recordMany($entity, $ids);

        return count($ids);
    }

    /** Filas cambiadas desde la última pasada y después de la fecha en que se anotaron. */
    private function recordUpdated(string $entity, string $table, string $since): int
    {
        $ids = DB::table("{$table} as t")
            ->join('sync_changes as s', function ($join) use ($entity) {
                $join->on('s.entity_id', '=', 't.id')->where('s.entity', '=', $entity);
            })
            ->where('t.updated_at', '>=', $since)
            ->whereColumn('t.updated_at', '>', 's.created_at')
            ->pluck('t.id')
            ->all();
        $this->recorder->recordMany($entity, $ids);

        return count($ids);
    }

    /** Filas que existen pero nunca se anotaron (ids más bajos que el último registrado). */
    private function recordGaps(string $entity, string $table): int
    {
        $ids = DB::table("{$table} as t")
            ->leftJoin('sync_changes as s', function ($join) use ($entity) {
                $join->on('s.entity_id', '=', 't.id')->where('s.entity', '=', $entity);
            })
            ->whereNull('s.id')
            ->pluck('t.id')
            ->all();
        $this->recorder->recordMany($entity, $ids);

        return count($ids);
    }

    /** Filas anotadas como existentes que ya no están en la tabla: se anotan como borradas. */
    private function recordDeleted(string $entity, string $table): int
    {
        $ids = DB::table('sync_changes as s')
            ->leftJoin("{$table} as t", 't.id', '=', 's.entity_id')
            ->where('s.entity', $entity)
            ->where('s.deleted', false)
            ->whereNull('t.id')
            ->pluck('s.entity_id')
            ->all();
        $this->recorder->recordMany($entity, $ids, deleted: true);

        return count($ids);
    }

    /** Desde cuándo buscar modificados: la última pasada o, la primera vez, la última reconstrucción. */
    private function since(): string
    {
        $stored = Cache::get(self::SINCE);
        if (is_string($stored)) {
            return $stored;
        }

        return (string) (DB::table('sync_changes')->where('entity', SyncChangeRecorder::RESET)->value('created_at')
            ?? now()->subDay()->toDateTimeString());
    }

    private function isDue(string $key, int $interval): bool
    {
        $last = Cache::get($key);

        return $last === null || now()->getTimestamp() - (int) $last >= $interval;
    }
}
