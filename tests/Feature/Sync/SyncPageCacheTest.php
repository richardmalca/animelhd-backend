<?php

use App\Services\Sync\SyncPageCache;
use App\Services\Sync\SyncService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Muchas apps piden `/api/sync` a la vez (por ejemplo, al subirse un capítulo). Estas pruebas comprueban que la
 * base de datos arme cada página una sola vez, que haya un tope de trabajo simultáneo y que, si no hay turno, la
 * app reciba 503 con Retry-After.
 */
const PAGECACHE_KEY = 'clave-de-prueba';

/** Servicio que cuenta cuántas veces se armó una página. */
class CountingSyncService extends SyncService
{
    public int $calls = 0;

    public function page(int $cursor, int $limit): array
    {
        $this->calls++;

        return parent::page($cursor, $limit);
    }
}

beforeEach(function () {
    config([
        'services.app_key_header.key' => PAGECACHE_KEY,
        'sync.settle_seconds' => 3,
        'sync.page_cache_seconds' => 60,
        'sync.max_concurrent' => 32,
        'sync.queue_wait_seconds' => 0,
        'sync.reconcile_interval' => 0,
    ]);
    Cache::flush();
    Carbon::setTestNow(Carbon::parse('2026-10-16 12:00:00'));

    foreach (['animes', 'genres', 'servers', 'episodes', 'players'] as $name) {
        Schema::create($name, function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }
    (require database_path('migrations/2026_10_15_000000_create_sync_changes_table.php'))->up();

    $this->counter = new CountingSyncService;
    $this->app->instance(SyncService::class, $this->counter);
});

afterEach(fn () => Carbon::setTestNow());

function addVisibleChange(): void
{
    $id = DB::table('animes')->insertGetId(['created_at' => now(), 'updated_at' => now()]);
    DB::table('sync_changes')->insert(['entity' => 'anime', 'entity_id' => $id, 'deleted' => false, 'created_at' => now()->subSeconds(10)]);
}

function pedirSync($test, int $cursor = 0)
{
    return $test->getJson("/api/sync?cursor={$cursor}&limit=5000", ['X-App-Key' => PAGECACHE_KEY]);
}

it('arma la misma página una sola vez aunque la pidan muchas apps', function () {
    addVisibleChange();

    foreach (range(1, 20) as $_) {
        pedirSync($this)->assertOk();
    }

    expect($this->counter->calls)->toBe(1);
});

it('páginas con distinto cursor se arman por separado', function () {
    addVisibleChange();
    addVisibleChange();
    $second = (int) DB::table('sync_changes')->where('entity', 'anime')->min('id');

    pedirSync($this, 0)->assertOk();
    pedirSync($this, $second)->assertOk();
    pedirSync($this, $second)->assertOk();

    expect($this->counter->calls)->toBe(2);
});

it('cuando aparece algo nuevo la página se vuelve a armar y lo incluye', function () {
    addVisibleChange();
    expect(pedirSync($this)->assertOk()->json('animes'))->toHaveCount(1);

    addVisibleChange();
    Carbon::setTestNow(now()->addSeconds(3));

    expect(pedirSync($this)->assertOk()->json('animes'))->toHaveCount(2);
    expect($this->counter->calls)->toBe(2);
});

it('un cambio recién anotado se ve al pasar los segundos de espera, sin esperar a que caduque la caché', function () {
    addVisibleChange();
    pedirSync($this)->assertOk();

    // Un cambio de este instante: todavía no es visible para las apps.
    $id = DB::table('animes')->insertGetId(['created_at' => now(), 'updated_at' => now()]);
    DB::table('sync_changes')->insert(['entity' => 'anime', 'entity_id' => $id, 'deleted' => false, 'created_at' => now()]);
    Carbon::setTestNow(now()->addSeconds(2));
    expect(pedirSync($this)->assertOk()->json('animes'))->toHaveCount(1);

    // Pasados los segundos de espera aparece, aunque la caché de la página siga vigente.
    Carbon::setTestNow(now()->addSeconds(2));
    expect(pedirSync($this)->assertOk()->json('animes'))->toHaveCount(2);
});

it('sin caché cada petición arma su página', function () {
    config(['sync.page_cache_seconds' => 0]);
    addVisibleChange();

    pedirSync($this)->assertOk();
    pedirSync($this)->assertOk();

    expect($this->counter->calls)->toBe(2);
});

it('si ya hay demasiadas páginas armándose, responde 503 con Retry-After', function () {
    config(['sync.max_concurrent' => 2, 'sync.queue_wait_seconds' => 0]);
    addVisibleChange();
    Cache::put('sync:compute:slots', 2, 30);

    $response = pedirSync($this)->assertStatus(503);

    expect((int) $response->headers->get('Retry-After'))->toBeGreaterThanOrEqual(2);
    expect($response->json('message'))->toBeString();
    expect($this->counter->calls)->toBe(0);
});

it('un turno ocupado no impide servir lo que ya está en caché', function () {
    addVisibleChange();
    pedirSync($this)->assertOk();

    config(['sync.max_concurrent' => 1]);
    Cache::put('sync:compute:slots', 1, 30);

    pedirSync($this)->assertOk();
    expect($this->counter->calls)->toBe(1);
});

it('el turno se libera al terminar y también si armar la página falla', function () {
    config(['sync.max_concurrent' => 1]);
    addVisibleChange();

    pedirSync($this)->assertOk();
    expect((int) Cache::get('sync:compute:slots'))->toBe(0);

    $falla = new class extends SyncService
    {
        public function page(int $cursor, int $limit): array
        {
            throw new RuntimeException('falló');
        }
    };
    $this->app->instance(SyncService::class, $falla);
    Cache::flush();

    expect(fn () => app(SyncPageCache::class)->page(0, 100))->toThrow(RuntimeException::class);
    expect((int) Cache::get('sync:compute:slots'))->toBe(0);
});

it('un turno ocupado se libera solo cuando caduca el contador', function () {
    config(['sync.max_concurrent' => 1, 'sync.queue_wait_seconds' => 0]);
    addVisibleChange();
    Cache::put('sync:compute:slots', 1, 30);
    pedirSync($this)->assertStatus(503);

    // Si un proceso murió sin soltar su turno, el contador caduca y el servidor vuelve a responder.
    Carbon::setTestNow(now()->addSeconds(31));

    pedirSync($this)->assertOk();
});
