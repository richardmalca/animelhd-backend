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
 * Está pensada para no cargar la API:
 *  - la pasada rápida corre como mucho una vez por intervalo (un candado evita que dos peticiones la hagan a
 *    la vez); el resto de las peticiones solo leen una marca en la caché;
 *  - lo nuevo se busca solo por encima del id más alto ya registrado (índice de la llave primaria) y lo
 *    modificado solo desde la última pasada (índice de `updated_at`) y solo si cambió después de anotarse,
 *    así que cada fila se anota una vez y las apps solo bajan lo que de verdad cambió;
 *  - cada pasada tiene un tope de filas: si hay un atraso grande (por ejemplo, tras días sin revisar), se
 *    reparte entre varias pasadas en vez de bloquear una petición;
 *  - huecos, borrados y huérfanos (episodios o reproductores cuyo anime ya no existe) cruzan las tablas
 *    completas, así que van aparte, cada tanto y después de responder.
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
     * Se llama al servir `/api/sync`. La pasada rápida (nuevos y modificados) corre antes de responder, para que
     * la app reciba enseguida lo último. La revisión de huecos y borrados corre después de enviar la respuesta.
     * Nunca rompe la sincronización: si algo falla, se reporta y sigue.
     */
    public function reconcileIfDue(): void
    {
        $interval = (int) config('sync.reconcile_interval');
        if ($interval <= 0) {
            return;
        }

        try {
            if ($this->isDue(self::QUICK_AT, $interval)) {
                Cache::lock('sync:reconcile', 60)->get(function () use ($interval) {
                    if ($this->isDue(self::QUICK_AT, $interval)) {
                        $this->reconcileQuick();
                    }
                });
            }

            $this->scheduleFullAfterResponse();
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Pasada completa a pedido (comando manual): rápida y, si se pide, también huecos y borrados.
     *
     * @return array<string, array{new: int, updated: int, gaps: int, deleted: int}>
     */
    public function reconcile(bool $full = false): array
    {
        $summary = $this->reconcileQuick();

        if ($full) {
            foreach ($this->reconcileFull() as $entity => $counts) {
                $summary[$entity] = [...$summary[$entity], ...$counts];
            }
        }

        return $summary;
    }

    /**
     * Lo nuevo y lo modificado. Barata: consultas por índice y con tope de filas.
     *
     * @return array<string, array{new: int, updated: int, gaps: int, deleted: int}>
     */
    public function reconcileQuick(): array
    {
        $startedAt = now();
        $since = $this->since();
        $batch = max(1, (int) config('sync.reconcile_batch'));
        $summary = [];
        $backlog = false;

        foreach (SyncChangeRecorder::TABLES as $entity => $table) {
            $new = $this->recordNew($entity, $table, $batch);
            $updated = $this->recordUpdated($entity, $table, $since, $batch);
            $summary[$entity] = ['new' => $new, 'updated' => $updated, 'gaps' => 0, 'deleted' => 0];
            $backlog = $backlog || $new >= $batch || $updated >= $batch;
        }

        // Con atraso (alguna entidad llegó al tope) no se avanza la fecha de búsqueda: lo que falte se retoma
        // en la siguiente pasada.
        if (! $backlog) {
            Cache::forever(self::SINCE, $startedAt->subSeconds(self::MARGIN)->toDateTimeString());
        }
        Cache::forever(self::QUICK_AT, $startedAt->getTimestamp());

        return $summary;
    }

    /**
     * Huecos y borrados: cruza las tablas completas. Más cara, por eso se usa poco.
     *
     * @return array<string, array{gaps: int, deleted: int}>
     */
    public function reconcileFull(): array
    {
        $summary = [];
        foreach (SyncChangeRecorder::TABLES as $entity => $table) {
            $summary[$entity] = [
                // Huecos y filas que recuperaron a su padre vuelven a verse; borradas y huérfanas dejan de verse.
                'gaps' => $this->recordGaps($entity, $table) + $this->recordRevived($entity, $table),
                'deleted' => $this->recordDeleted($entity, $table),
            ];
        }
        Cache::forever(self::FULL_AT, now()->getTimestamp());

        return $summary;
    }

    /** Programa la revisión completa para después de enviar la respuesta, una vez por intervalo. */
    private function scheduleFullAfterResponse(): void
    {
        $interval = (int) config('sync.reconcile_full_interval');
        if ($interval <= 0 || ! $this->isDue(self::FULL_AT, $interval)) {
            return;
        }

        // `add` solo deja pasar a una petición: las demás ven que ya está programada.
        if (! Cache::add('sync:reconcile:full_scheduled', 1, 600)) {
            return;
        }

        dispatch(function () {
            try {
                Cache::lock('sync:reconcile:full', 600)->get(fn () => $this->reconcileFull());
            } catch (\Throwable $e) {
                report($e);
            } finally {
                Cache::forget('sync:reconcile:full_scheduled');
            }
        })->afterResponse();
    }

    /** Filas con un id más alto que el último registrado: lo que se creó fuera de esta app. */
    private function recordNew(string $entity, string $table, int $limit): int
    {
        $last = (int) DB::table('sync_changes')->where('entity', $entity)->max('entity_id');
        $ids = DB::table($table)->where('id', '>', $last)->orderBy('id')->limit($limit)->pluck('id')->all();
        $this->recorder->recordMany($entity, $ids);

        return count($ids);
    }

    /** Filas cambiadas desde la última pasada y después de la fecha en que se anotaron. */
    private function recordUpdated(string $entity, string $table, string $since, int $limit): int
    {
        $ids = DB::table("{$table} as t")
            ->join('sync_changes as s', function ($join) use ($entity) {
                $join->on('s.entity_id', '=', 't.id')->where('s.entity', '=', $entity);
            })
            ->where('s.deleted', false)
            ->where('t.updated_at', '>=', $since)
            ->whereColumn('t.updated_at', '>', 's.created_at')
            ->orderBy('t.id')
            ->limit($limit)
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

    /**
     * Filas anotadas como vivas que ya no deben verse: las que desaparecieron de la tabla y las huérfanas (su anime,
     * episodio o servidor ya no existe, aunque nadie las haya borrado). Las apps las reciben como borradas.
     */
    private function recordDeleted(string $entity, string $table): int
    {
        $missing = DB::table('sync_changes as s')
            ->leftJoin("{$table} as t", 't.id', '=', 's.entity_id')
            ->where('s.entity', $entity)
            ->where('s.deleted', false)
            ->whereNull('t.id')
            ->pluck('s.entity_id')
            ->all();

        $orphans = $this->orphanIds($entity);
        $liveOrphans = [];
        foreach (array_chunk($orphans, 1000) as $chunk) {
            array_push($liveOrphans, ...DB::table('sync_changes')
                ->where('entity', $entity)
                ->where('deleted', false)
                ->whereIn('entity_id', $chunk)
                ->pluck('entity_id')
                ->all());
        }

        $ids = array_values(array_unique([...$missing, ...$liveOrphans]));
        $this->recorder->recordMany($entity, $ids, deleted: true);

        return count($ids);
    }

    /** Filas anotadas como borradas que existen y ya tienen a sus padres otra vez: vuelven a verse. */
    private function recordRevived(string $entity, string $table): int
    {
        $orphans = array_flip($this->orphanIds($entity));
        $ids = DB::table('sync_changes as s')
            ->join("{$table} as t", 't.id', '=', 's.entity_id')
            ->where('s.entity', $entity)
            ->where('s.deleted', true)
            ->pluck('s.entity_id')
            ->filter(fn ($id) => ! isset($orphans[$id]))
            ->values()
            ->all();
        $this->recorder->recordMany($entity, $ids);

        return count($ids);
    }

    /**
     * Filas que existen pero cuyo padre no: episodios sin anime y reproductores sin episodio (o sin el anime de ese
     * episodio) o sin servidor. Pasa cuando se borra un anime sin borrar lo que cuelga de él.
     *
     * @return array<int, int>
     */
    private function orphanIds(string $entity): array
    {
        return match ($entity) {
            SyncChangeRecorder::EPISODE => DB::table('episodes as t')
                ->whereNotExists(fn ($q) => $q->selectRaw('1')->from('animes as a')->whereColumn('a.id', 't.anime_id'))
                ->pluck('t.id')
                ->all(),
            SyncChangeRecorder::PLAYER => DB::table('players as t')
                ->where(function ($where) {
                    $where->whereNotExists(function ($q) {
                        $q->selectRaw('1')->from('episodes as e')
                            ->join('animes as a', 'a.id', '=', 'e.anime_id')
                            ->whereColumn('e.id', 't.episode_id');
                    })->orWhereNotExists(fn ($q) => $q->selectRaw('1')->from('servers as v')->whereColumn('v.id', 't.server_id'));
                })
                ->pluck('t.id')
                ->all(),
            default => [],
        };
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
