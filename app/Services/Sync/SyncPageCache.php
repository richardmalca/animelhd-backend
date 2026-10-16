<?php

namespace App\Services\Sync;

use App\Models\SyncChange;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;

/**
 * Protege a la base de datos y a la API cuando muchas apps piden `/api/sync` a la vez (por ejemplo, al subirse
 * un capítulo y abrir la app miles de personas casi al mismo tiempo).
 *
 *  1. Caché corta por página: casi todas las apps piden el mismo cursor, así que la respuesta es idéntica. La clave
 *     incluye el id del último cambio: en cuanto hay algo nuevo, la clave cambia y la página se vuelve a armar.
 *  2. Una sola calcula: si cien peticiones piden la misma página a la vez, una arma la respuesta y las demás
 *     esperan ese resultado en vez de repetir las mismas consultas.
 *  3. Tope de trabajo simultáneo: solo hay `max_concurrent` páginas armándose a la vez contra la base de datos.
 *     Las demás esperan un turno hasta `queue_wait_seconds` y, si no llega, se devuelve `null` (la ruta responde
 *     503 con `Retry-After`) para que la app reintente en vez de apilarse.
 *
 * Todo usa la caché compartida (Redis en producción), así que vale entre todos los procesos de PHP.
 */
class SyncPageCache
{
    private const SLOTS = 'sync:compute:slots';

    public function __construct(private readonly SyncService $service) {}

    /**
     * @return array<string, mixed>|null `null` si el servidor está saturado y no hubo turno a tiempo.
     */
    public function page(int $cursor, int $limit): ?array
    {
        $ttl = (int) config('sync.page_cache_seconds');
        if ($ttl <= 0) {
            return $this->withSlot(fn () => $this->service->page($cursor, $limit));
        }

        // El último cambio ya visible para las apps (pasados los segundos de `sync.settle_seconds`), consultado como
        // mucho una vez cada dos segundos. Así la clave cambia justo cuando algo nuevo se vuelve visible.
        $latest = (int) Cache::remember('sync:latest_id', 2, fn () => (int) SyncChange::query()
            ->where('created_at', '<=', now()->subSeconds((int) config('sync.settle_seconds')))
            ->max('id'));
        $key = "sync:page:{$latest}:{$cursor}:{$limit}";

        $hit = Cache::get($key);
        if ($hit !== null) {
            return $hit;
        }

        $lock = Cache::lock("sync:flight:{$key}", 30);
        try {
            $lock->block(max(0, (int) config('sync.queue_wait_seconds')));
        } catch (LockTimeoutException) {
            // Otra petición lleva esperando mucho armando esta misma página: se usa lo que haya dejado.
            return Cache::get($key);
        }

        try {
            $hit = Cache::get($key);
            if ($hit !== null) {
                return $hit;
            }

            $page = $this->withSlot(fn () => $this->service->page($cursor, $limit));
            if ($page !== null) {
                Cache::put($key, $page, $ttl);
            }

            return $page;
        } finally {
            $lock->release();
        }
    }

    /**
     * Ejecuta `$work` si hay un turno libre; si no, espera con pausas cortas (distintas en cada petición para que
     * no se despierten todas juntas) hasta `queue_wait_seconds`.
     *
     * @template T
     *
     * @param  callable(): T  $work
     * @return T|null
     */
    private function withSlot(callable $work): mixed
    {
        $limit = (int) config('sync.max_concurrent');
        if ($limit <= 0) {
            return $work();
        }

        $deadline = microtime(true) + max(0, (float) config('sync.queue_wait_seconds'));
        do {
            // El contador caduca solo: si un proceso muere sin soltar su turno, no queda ocupado para siempre.
            Cache::add(self::SLOTS, 0, 30);
            if (Cache::increment(self::SLOTS) <= $limit) {
                try {
                    return $work();
                } finally {
                    Cache::decrement(self::SLOTS);
                }
            }
            Cache::decrement(self::SLOTS);
            usleep(random_int(40_000, 120_000));
        } while (microtime(true) < $deadline);

        return null;
    }
}
