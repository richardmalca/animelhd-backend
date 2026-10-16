<?php

use App\Models\SyncChange;
use App\Services\Sync\SyncReconciler;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Lo que otras apps (la API, el admin, un script) escriben en la base de datos no pasa por los observers de
 * esta app. Estas pruebas escriben con `DB::table`, igual que ellas, y comprueban que el registro lo alcance.
 */
const RECONCILE_KEY = 'clave-de-prueba';

beforeEach(function () {
    config(['services.app_key_header.key' => RECONCILE_KEY, 'sync.settle_seconds' => 0, 'sync.reconcile_interval' => 60]);
    Cache::flush();
    Carbon::setTestNow(Carbon::parse('2026-10-16 12:00:00'));

    foreach (['animes', 'genres', 'servers', 'episodes', 'players'] as $name) {
        Schema::create($name, function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }

    $migration = require database_path('migrations/2026_10_15_000000_create_sync_changes_table.php');
    $migration->up();
});

afterEach(function () {
    Carbon::setTestNow();
});

function externalInsert(string $table, int $count = 1, ?string $updatedAt = null): array
{
    $ids = [];
    for ($i = 0; $i < $count; $i++) {
        $ids[] = DB::table($table)->insertGetId([
            'created_at' => now()->toDateTimeString(),
            'updated_at' => $updatedAt ?? now()->toDateTimeString(),
        ]);
    }

    return $ids;
}

function recordedIds(string $entity): array
{
    return SyncChange::where('entity', $entity)->where('deleted', false)->pluck('entity_id')->sort()->values()->all();
}

it('anota lo creado por otra app', function () {
    $ids = externalInsert('episodes', 3);
    expect(recordedIds('episode'))->toBe([]);

    $summary = app(SyncReconciler::class)->reconcile();

    expect(recordedIds('episode'))->toBe($ids);
    expect($summary['episode']['new'])->toBe(3);
});

it('no vuelve a anotar lo que no cambió', function () {
    externalInsert('players', 2);
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcile();
    $cursor = (int) SyncChange::max('id');

    Carbon::setTestNow(now()->addMinutes(5));
    $summary = $reconciler->reconcile();

    expect((int) SyncChange::max('id'))->toBe($cursor);
    expect($summary['player'])->toMatchArray(['new' => 0, 'updated' => 0]);
});

it('anota lo modificado por otra app después de anotarse', function () {
    [$id] = externalInsert('animes');
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcile();
    $before = (int) SyncChange::where('entity', 'anime')->where('entity_id', $id)->value('id');

    Carbon::setTestNow(now()->addMinutes(5));
    DB::table('animes')->where('id', $id)->update(['updated_at' => now()->toDateTimeString()]);
    $summary = $reconciler->reconcile();

    $after = (int) SyncChange::where('entity', 'anime')->where('entity_id', $id)->value('id');
    expect($summary['anime']['updated'])->toBe(1);
    expect($after)->toBeGreaterThan($before);
});

it('en la revisión completa llena huecos y marca borrados', function () {
    [$kept, $removed] = externalInsert('servers', 2);
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcile();

    // Un hueco: una fila con un id más bajo que el último registrado, escrita después.
    DB::table('servers')->insert(['id' => 99, 'created_at' => now(), 'updated_at' => now()]);
    $reconciler->reconcile();
    DB::table('servers')->insert(['id' => 50, 'created_at' => now(), 'updated_at' => now()]);
    DB::table('servers')->where('id', $removed)->delete();

    $summary = $reconciler->reconcile(full: true);

    expect($summary['server']['gaps'])->toBe(1);
    expect($summary['server']['deleted'])->toBe(1);
    expect(recordedIds('server'))->toContain(50)->toContain($kept)->not->toContain($removed);
    expect(SyncChange::where('entity', 'server')->where('entity_id', $removed)->value('deleted'))->toBeTruthy();
});

it('la revisión rápida no cruza las tablas completas', function () {
    externalInsert('episodes', 2);
    DB::table('episodes')->insert(['id' => 1000, 'created_at' => now(), 'updated_at' => now()]);
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcile();
    DB::table('episodes')->insert(['id' => 500, 'created_at' => now(), 'updated_at' => now()]);

    $summary = $reconciler->reconcile(full: false);

    expect($summary['episode']['gaps'])->toBe(0);
    expect(recordedIds('episode'))->not->toContain(500);
});

it('solo revisa una vez por intervalo al pedir /api/sync', function () {
    $reconciler = app(SyncReconciler::class);
    externalInsert('episodes', 1);
    $reconciler->reconcileIfDue();
    expect(recordedIds('episode'))->toHaveCount(1);

    externalInsert('episodes', 1);
    $reconciler->reconcileIfDue();
    expect(recordedIds('episode'))->toHaveCount(1);

    Carbon::setTestNow(now()->addSeconds(61));
    $reconciler->reconcileIfDue();
    expect(recordedIds('episode'))->toHaveCount(2);
});

it('no revisa nada si el intervalo es cero', function () {
    config(['sync.reconcile_interval' => 0]);
    externalInsert('episodes', 1);

    app(SyncReconciler::class)->reconcileIfDue();

    expect(recordedIds('episode'))->toBe([]);
});

it('GET /api/sync entrega lo que otra app escribió', function () {
    $ids = externalInsert('episodes', 2);

    $page = $this->getJson('/api/sync?cursor=0&limit=5000', ['X-App-Key' => RECONCILE_KEY])->assertOk()->json();

    expect(collect($page['episodes'])->pluck('id')->sort()->values()->all())->toBe($ids);
});

it('si la revisión falla, /api/sync sigue respondiendo', function () {
    Schema::drop('players');

    $this->getJson('/api/sync?cursor=0&limit=5000', ['X-App-Key' => RECONCILE_KEY])->assertOk();
});

it('el comando sync:reconcile anota y muestra el resumen', function () {
    externalInsert('episodes', 2);

    $this->artisan('sync:reconcile', ['--full' => true])->assertSuccessful();

    expect(recordedIds('episode'))->toHaveCount(2);
});
