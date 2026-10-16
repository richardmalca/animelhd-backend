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
        Schema::create($name, function (Blueprint $table) use ($name) {
            $table->id();
            if ($name === 'episodes') {
                $table->unsignedBigInteger('anime_id')->default(0);
            }
            if ($name === 'players') {
                $table->unsignedBigInteger('episode_id')->default(0);
                $table->unsignedBigInteger('server_id')->default(0);
            }
            $table->timestamps();
        });
    }

    $migration = require database_path('migrations/2026_10_15_000000_create_sync_changes_table.php');
    $migration->up();
});

afterEach(function () {
    Carbon::setTestNow();
});

function externalInsert(string $table, int $count = 1, ?string $updatedAt = null, array $extra = []): array
{
    $ids = [];
    for ($i = 0; $i < $count; $i++) {
        $ids[] = DB::table($table)->insertGetId([
            'created_at' => now()->toDateTimeString(),
            'updated_at' => $updatedAt ?? now()->toDateTimeString(),
        ] + $extra);
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
    [$anime] = externalInsert('animes');
    externalInsert('episodes', 1, extra: ['anime_id' => $anime]);
    $reconciler->reconcileIfDue();
    expect(recordedIds('episode'))->toHaveCount(1);

    externalInsert('episodes', 1, extra: ['anime_id' => $anime]);
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

it('un atraso grande se reparte en varias pasadas', function () {
    config(['sync.reconcile_batch' => 3]);
    $ids = externalInsert('episodes', 7);
    $reconciler = app(SyncReconciler::class);

    $reconciler->reconcileQuick();
    expect(recordedIds('episode'))->toBe(array_slice($ids, 0, 3));

    $reconciler->reconcileQuick();
    $reconciler->reconcileQuick();
    expect(recordedIds('episode'))->toBe($ids);
});

it('lo modificado dentro de un atraso no se pierde', function () {
    config(['sync.reconcile_batch' => 2]);
    $ids = externalInsert('players', 5);
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcileQuick();
    $reconciler->reconcileQuick();
    $reconciler->reconcileQuick();

    Carbon::setTestNow(now()->addMinutes(10));
    DB::table('players')->update(['updated_at' => now()->toDateTimeString()]);
    $reconciler->reconcileQuick();
    $reconciler->reconcileQuick();
    $summary = $reconciler->reconcileQuick();

    expect($summary['player']['updated'])->toBe(1);
    $stale = DB::table('players as t')->join('sync_changes as s', fn ($j) => $j->on('s.entity_id', '=', 't.id')->where('s.entity', 'player'))
        ->whereColumn('t.updated_at', '>', 's.created_at')->count();
    expect($stale)->toBe(0);
});

it('la revisión completa se programa después de responder y una sola vez', function () {
    config(['sync.reconcile_full_interval' => 3600]);
    DB::table('servers')->insert(['id' => 5, 'created_at' => now(), 'updated_at' => now()]);
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcileQuick();
    DB::table('servers')->insert(['id' => 3, 'created_at' => now(), 'updated_at' => now()]);

    $this->getJson('/api/sync?cursor=0', ['X-App-Key' => RECONCILE_KEY])->assertOk();

    expect(recordedIds('server'))->toContain(3);
    expect(Cache::get('sync:reconcile:full_at'))->not->toBeNull();
});

function catalogTree(): array
{
    $anime = DB::table('animes')->insertGetId(['created_at' => now(), 'updated_at' => now()]);
    $server = DB::table('servers')->insertGetId(['created_at' => now(), 'updated_at' => now()]);
    $episodes = [];
    $players = [];
    foreach ([1, 2] as $_) {
        $episode = DB::table('episodes')->insertGetId(['anime_id' => $anime, 'created_at' => now(), 'updated_at' => now()]);
        $episodes[] = $episode;
        $players[] = DB::table('players')->insertGetId(['episode_id' => $episode, 'server_id' => $server, 'created_at' => now(), 'updated_at' => now()]);
    }

    return compact('anime', 'server', 'episodes', 'players');
}

it('si se borra un anime sin borrar sus episodios y reproductores, las apps los reciben como borrados', function () {
    $tree = catalogTree();
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcile();

    DB::table('animes')->where('id', $tree['anime'])->delete();
    $summary = $reconciler->reconcile(full: true);

    expect($summary['anime']['deleted'])->toBe(1);
    expect($summary['episode']['deleted'])->toBe(2);
    expect($summary['player']['deleted'])->toBe(2);
    expect(recordedIds('anime'))->toBe([]);
    expect(recordedIds('episode'))->toBe([]);
    expect(recordedIds('player'))->toBe([]);
});

it('si la base borra en cascada, cada tabla se anota como borrada por su cuenta', function () {
    $tree = catalogTree();
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcile();

    DB::table('players')->whereIn('id', $tree['players'])->delete();
    DB::table('episodes')->whereIn('id', $tree['episodes'])->delete();
    DB::table('animes')->where('id', $tree['anime'])->delete();
    $reconciler->reconcile(full: true);

    expect(recordedIds('anime'))->toBe([]);
    expect(recordedIds('episode'))->toBe([]);
    expect(recordedIds('player'))->toBe([]);
    expect(SyncChange::where('entity', 'player')->where('deleted', true)->count())->toBe(2);
});

it('borrar un episodio deja sin visibilidad a sus reproductores y el anime sigue', function () {
    $tree = catalogTree();
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcile();

    DB::table('episodes')->where('id', $tree['episodes'][0])->delete();
    $reconciler->reconcile(full: true);

    expect(recordedIds('anime'))->toBe([$tree['anime']]);
    expect(recordedIds('episode'))->toBe([$tree['episodes'][1]]);
    expect(recordedIds('player'))->toBe([$tree['players'][1]]);
});

it('un reproductor cuyo servidor desapareció deja de verse', function () {
    $tree = catalogTree();
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcile();

    DB::table('servers')->where('id', $tree['server'])->delete();
    $reconciler->reconcile(full: true);

    expect(recordedIds('server'))->toBe([]);
    expect(recordedIds('player'))->toBe([]);
});

it('lo huérfano que recupera a su padre vuelve a verse', function () {
    $tree = catalogTree();
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcile();
    $row = (array) DB::table('animes')->where('id', $tree['anime'])->first();
    DB::table('animes')->where('id', $tree['anime'])->delete();
    $reconciler->reconcile(full: true);
    expect(recordedIds('episode'))->toBe([]);

    DB::table('animes')->insert($row);
    $reconciler->reconcile(full: true);

    expect(recordedIds('anime'))->toBe([$tree['anime']]);
    expect(recordedIds('episode'))->toBe($tree['episodes']);
    expect(recordedIds('player'))->toBe($tree['players']);
});

it('los contadores de vistas, que no tocan updated_at, no generan cambios', function () {
    $tree = catalogTree();
    Schema::table('animes', fn (Blueprint $table) => $table->integer('views')->default(0));
    $reconciler = app(SyncReconciler::class);
    $reconciler->reconcile();
    $cursor = (int) SyncChange::max('id');

    Carbon::setTestNow(now()->addMinutes(5));
    DB::table('animes')->where('id', $tree['anime'])->increment('views', 10);
    $reconciler->reconcile();

    expect((int) SyncChange::max('id'))->toBe($cursor);
});

it('el comando sync:reconcile anota y muestra el resumen', function () {
    catalogTree();

    $this->artisan('sync:reconcile', ['--full' => true])->assertSuccessful();

    expect(recordedIds('episode'))->toHaveCount(2);
    expect(recordedIds('player'))->toHaveCount(2);
});
