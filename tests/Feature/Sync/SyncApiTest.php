<?php

use App\Models\Anime;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\Player;
use App\Models\Server;
use App\Models\SyncChange;
use App\Services\Api\AnimeSyncService;
use App\Services\Sync\SyncChangeRecorder;
use App\Services\Sync\SyncService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Schema;

const SYNC_TEST_KEY = 'clave-de-prueba';
const SYNC_MIGRATION = '2026_10_15_000000_create_sync_changes_table.php';

/**
 * Las tablas del catálogo vienen de antes y no tienen migraciones en este repositorio,
 * así que las pruebas crean versiones con las columnas que usa la sincronización.
 */
function createLegacyTables(): void
{
    Schema::create('animes', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('name_alternative')->nullable();
        $table->string('slug')->nullable();
        $table->text('overview')->nullable();
        $table->string('poster')->nullable();
        $table->string('banner')->nullable();
        $table->date('aired')->nullable();
        $table->string('type')->default('TV');
        $table->integer('status')->default(0);
        $table->string('premiered')->nullable();
        $table->string('broadcast')->nullable();
        $table->boolean('airing')->default(false);
        $table->text('genres')->nullable();
        $table->float('vote_average')->default(0);
        $table->unsignedBigInteger('prequel')->nullable();
        $table->unsignedBigInteger('sequel')->nullable();
        $table->string('related')->nullable();
        $table->integer('views')->default(0);
        $table->integer('views_app')->default(0);
        $table->boolean('isTopic')->default(false);
        $table->unsignedBigInteger('mal_id')->nullable();
        $table->unsignedBigInteger('anilist_id')->nullable();
        $table->unsignedBigInteger('tmdb_id')->nullable();
        $table->string('short_name')->nullable();
        $table->string('rating')->default('');
        $table->integer('popularity')->default(0);
        $table->string('trailer')->nullable();
        $table->string('slug_tio')->nullable();
        $table->boolean('active_tio')->default(false);
        $table->timestamps();
    });

    Schema::create('genres', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->string('slug');
        $table->string('name_mal')->nullable();
        $table->timestamps();
    });

    Schema::create('servers', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->string('embed')->default('');
        $table->string('type')->nullable();
        $table->integer('status')->default(1);
        $table->integer('position')->default(0);
        $table->boolean('show_on_web_desktop')->default(true);
        $table->boolean('show_on_web_mobile')->default(true);
        $table->boolean('show_on_app')->default(true);
        $table->json('domains')->nullable();
        $table->timestamps();
    });

    Schema::create('episodes', function (Blueprint $table) {
        $table->id();
        $table->decimal('number', 8, 2);
        $table->integer('views')->default(0);
        $table->integer('views_app')->default(0);
        $table->unsignedBigInteger('anime_id');
        $table->timestamps();
    });

    Schema::create('players', function (Blueprint $table) {
        $table->id();
        $table->string('code');
        $table->string('languaje');
        $table->unsignedBigInteger('server_id');
        $table->unsignedBigInteger('episode_id');
        $table->string('code_backup')->nullable();
        $table->timestamps();
    });
}

function runSyncMigration(): void
{
    $migration = require database_path('migrations/'.SYNC_MIGRATION);
    $migration->up();
}

function newAnime(string $name = 'Naruto'): Anime
{
    return Anime::create(['name' => $name, 'slug' => str($name)->slug()->toString()]);
}

function newServer(string $title = 'Voe'): Server
{
    return Server::create(['title' => $title, 'embed' => 'https://voe.example/e/%%code%%']);
}

function newEpisode(Anime $anime, int $number = 1): Episode
{
    return Episode::create(['anime_id' => $anime->id, 'number' => $number]);
}

function newPlayer(Episode $episode, Server $server, string $language = '0', string $code = 'abc123'): Player
{
    return Player::create([
        'episode_id' => $episode->id,
        'server_id' => $server->id,
        'languaje' => $language,
        'code' => $code,
    ]);
}

function lastChangeId(): int
{
    return (int) SyncChange::max('id');
}

/**
 * Pide todas las páginas desde un cursor y devuelve las páginas recibidas.
 *
 * @return array<int, array<string, mixed>>
 */
function syncPages($test, int $cursor = 0, int $limit = 5000): array
{
    $pages = [];
    do {
        $response = $test->getJson("/api/sync?cursor={$cursor}&limit={$limit}", ['X-App-Key' => SYNC_TEST_KEY])->assertOk();
        $page = $response->json();
        $pages[] = $page;
        $cursor = $page['cursor'];
    } while ($page['has_more']);

    return $pages;
}

function syncOnce($test, int $cursor = 0, int $limit = 5000): array
{
    return $test->getJson("/api/sync?cursor={$cursor}&limit={$limit}", ['X-App-Key' => SYNC_TEST_KEY])->assertOk()->json();
}

beforeEach(function () {
    config(['services.app_key_header.key' => SYNC_TEST_KEY, 'sync.settle_seconds' => 0]);

    // Episode y Player publican marcadores en el Redis compartido al guardarse; aquí no hay Redis.
    $redis = Mockery::mock();
    $redis->shouldReceive('set')->andReturnTrue();
    Redis::shouldReceive('connection')->with('shared')->andReturn($redis);

    // Normalmente las pruebas usan SQLite en memoria (ver phpunit.xml). Para comprobarlas contra una
    // base MySQL desechable, se activa SYNC_TEST_ALLOW_DROP=1: borra TODAS las tablas de esa base.
    if (env('SYNC_TEST_ALLOW_DROP') === '1') {
        Schema::dropAllTables();
    }

    createLegacyTables();
    runSyncMigration();
});

describe('acceso y validación', function () {
    it('rechaza peticiones sin llave', function () {
        $this->getJson('/api/sync')->assertForbidden();
    });

    it('rechaza una llave incorrecta', function () {
        $this->getJson('/api/sync', ['X-App-Key' => 'otra'])->assertForbidden();
    });

    it('valida el cursor y el límite', function () {
        $headers = ['X-App-Key' => SYNC_TEST_KEY];

        $this->getJson('/api/sync?cursor=-1', $headers)->assertUnprocessable();
        $this->getJson('/api/sync?cursor=abc', $headers)->assertUnprocessable();
        $this->getJson('/api/sync?limit=0', $headers)->assertUnprocessable();
        $this->getJson('/api/sync?limit=10001', $headers)->assertUnprocessable();
        $this->getJson('/api/sync?limit=10000', $headers)->assertOk();
    });

    it('no se guarda en caché', function () {
        $this->getJson('/api/sync', ['X-App-Key' => SYNC_TEST_KEY])->assertHeader('Cache-Control', 'no-store, private');
    });

    it('sin cambios devuelve una respuesta vacía con el mismo cursor', function () {
        $page = syncOnce($this);

        expect($page['cursor'])->toBe(0)
            ->and($page['has_more'])->toBeFalse()
            ->and($page['reset'])->toBeFalse()
            ->and($page['animes'])->toBe([])
            ->and($page['episodes'])->toBe([])
            ->and($page['players'])->toBe([])
            ->and($page['deleted'])->toBe(['animes' => [], 'genres' => [], 'servers' => [], 'episodes' => [], 'players' => []]);
    });
});

describe('contenido de la primera sincronización', function () {
    it('entrega animes, géneros, servidores, episodios y reproductores', function () {
        $anime = newAnime('One Piece');
        $genre = Genre::create(['title' => 'Acción', 'slug' => 'accion']);
        $server = newServer();
        $episode = newEpisode($anime, 7);
        $player = newPlayer($episode, $server, '1', 'xyz789');

        $page = syncOnce($this);

        expect(collect($page['animes'])->pluck('id')->all())->toBe([$anime->id])
            ->and(collect($page['genres'])->first())->toMatchArray(['id' => $genre->id, 'title' => 'Acción', 'slug' => 'accion'])
            ->and(collect($page['servers'])->pluck('id')->all())->toBe([$server->id])
            ->and(collect($page['episodes'])->first())->toMatchArray(['id' => $episode->id, 'anime_id' => $anime->id, 'number' => 7])
            ->and(collect($page['players'])->first())->toMatchArray([
                'id' => $player->id, 'episode_id' => $episode->id, 'server_id' => $server->id,
                'language' => 'LAT', 'code' => 'xyz789', 'code_backup' => null,
            ]);
    });

    it('los animes traen los mismos campos que /sync/animes', function () {
        newAnime();

        $anime = syncOnce($this)['animes'][0];

        expect(array_keys($anime))->toEqualCanonicalizing(AnimeSyncService::FIELDS);
    });

    it('los reproductores traen justo los campos acordados', function () {
        $server = newServer();
        newPlayer(newEpisode(newAnime()), $server);

        $player = syncOnce($this)['players'][0];

        expect(array_keys($player))->toBe(['id', 'episode_id', 'server_id', 'language', 'code', 'code_backup']);
    });

    it('traduce el idioma como el resto de la API', function () {
        $server = newServer();
        $episode = newEpisode(newAnime());
        foreach (['0' => 'SUB', '1' => 'LAT', '2' => 'ESP', 'JAP' => 'JAP'] as $raw => $expected) {
            newPlayer($episode, $server, (string) $raw, "code-{$raw}");
        }

        $languages = collect(syncOnce($this)['players'])->pluck('language', 'code');

        expect($languages->all())->toBe(['code-0' => 'SUB', 'code-1' => 'LAT', 'code-2' => 'ESP', 'code-JAP' => 'JAP']);
    });

    it('el número de episodio es entero cuando es exacto y decimal cuando hace falta', function () {
        $anime = newAnime();
        DB::table('episodes')->insert([
            ['anime_id' => $anime->id, 'number' => 3],
            ['anime_id' => $anime->id, 'number' => 12.5],
        ]);
        app(SyncChangeRecorder::class)->rebuild(); // DB::table no dispara los observadores

        $numbers = collect(syncOnce($this)['episodes'])->pluck('number')->all();

        expect($numbers)->toBe([3, 12.5]);
    });

    it('episodeNumber normaliza decimales de la base', function () {
        expect(SyncService::episodeNumber('3.00'))->toBe(3)
            ->and(SyncService::episodeNumber('12.50'))->toBe(12.5)
            ->and(SyncService::episodeNumber(7))->toBe(7)
            ->and(SyncService::episodeNumber(0))->toBe(0);
    });

    it('el episodio trae su fecha en ISO 8601', function () {
        $episode = newEpisode(newAnime());

        $created = syncOnce($this)['episodes'][0]['created_at'];

        expect($created)->toBe($episode->created_at->toISOString())
            ->and($created)->toEndWith('Z');
    });

    it('el servidor trae sus banderas como booleanos', function () {
        Server::create([
            'title' => 'Solo web', 'embed' => 'x', 'show_on_app' => false,
            'show_on_web_desktop' => true, 'show_on_web_mobile' => false,
        ]);

        $server = syncOnce($this)['servers'][0];

        expect($server['show_on_app'])->toBeFalse()
            ->and($server['show_on_web_desktop'])->toBeTrue()
            ->and($server['show_on_web_mobile'])->toBeFalse()
            ->and($server)->not->toHaveKey('domains');
    });
});

describe('cambios incrementales', function () {
    it('devuelve solo las novedades desde el cursor', function () {
        $server = newServer();
        $episode = newEpisode(newAnime(), 1);
        newPlayer($episode, $server);
        $cursor = syncOnce($this)['cursor'];

        $nuevo = newPlayer($episode, $server, '1', 'otro');
        $page = syncOnce($this, $cursor);

        expect(collect($page['players'])->pluck('id')->all())->toBe([$nuevo->id])
            ->and($page['animes'])->toBe([])
            ->and($page['episodes'])->toBe([])
            ->and($page['servers'])->toBe([])
            ->and($page['cursor'])->toBeGreaterThan($cursor);
    });

    it('un cambio vuelve a registrar la entidad con un cursor mayor y una sola fila', function () {
        $player = newPlayer(newEpisode(newAnime()), newServer());
        $before = lastChangeId();

        $player->update(['code' => 'nuevo-codigo']);

        expect(lastChangeId())->toBeGreaterThan($before)
            ->and(SyncChange::where('entity', 'player')->where('entity_id', $player->id)->count())->toBe(1);
        expect(syncOnce($this, $before)['players'][0]['code'])->toBe('nuevo-codigo');
    });

    it('no registra nada si no cambió nada', function () {
        $episode = newEpisode(newAnime());
        $server = newServer();
        Player::updateOrCreate(['episode_id' => $episode->id, 'server_id' => $server->id, 'languaje' => '0'], ['code' => 'igual']);
        $before = lastChangeId();

        Player::updateOrCreate(['episode_id' => $episode->id, 'server_id' => $server->id, 'languaje' => '0'], ['code' => 'igual']);

        expect(lastChangeId())->toBe($before);
    });

    it('subir un episodio con reproductores lo registra todo', function () {
        $anime = newAnime();
        $server = newServer();
        $cursor = lastChangeId();

        $episode = Episode::firstOrCreate(['anime_id' => $anime->id, 'number' => 3]);
        Player::updateOrCreate(
            ['episode_id' => $episode->id, 'server_id' => $server->id, 'languaje' => '0'],
            ['code' => 'bot-code', 'updated_at' => now()],
        );

        $page = syncOnce($this, $cursor);

        expect(collect($page['episodes'])->pluck('number')->all())->toBe([3])
            ->and(collect($page['players'])->pluck('code')->all())->toBe(['bot-code']);
    });

    it('los contadores de vistas no generan cambios', function () {
        $episode = newEpisode(newAnime());
        $before = lastChangeId();

        DB::table('episodes')->where('id', $episode->id)->increment('views', 5);
        DB::table('animes')->where('id', $episode->anime_id)->increment('views', 5);

        expect(lastChangeId())->toBe($before);
    });
});

describe('paginación', function () {
    it('recorre todo con páginas pequeñas sin repetir ni perder nada', function () {
        $server = newServer();
        $anime = newAnime();
        foreach (range(1, 6) as $number) {
            newPlayer(newEpisode($anime, $number), $server, '0', "code-{$number}");
        }
        // 1 anime + 1 servidor + 6 episodios + 6 reproductores = 14 entidades
        $pages = syncPages($this, limit: 3);

        $cursors = array_column($pages, 'cursor');
        $episodeIds = collect($pages)->flatMap(fn ($page) => array_column($page['episodes'], 'id'));
        $playerIds = collect($pages)->flatMap(fn ($page) => array_column($page['players'], 'id'));

        expect(count($pages))->toBe(5)
            ->and($cursors)->toBe(collect($cursors)->sort()->values()->all())
            ->and(collect($cursors)->unique()->count())->toBe(5)
            ->and($episodeIds)->toHaveCount(6)
            ->and($episodeIds->unique())->toHaveCount(6)
            ->and($playerIds->unique())->toHaveCount(6)
            ->and(end($pages)['has_more'])->toBeFalse();
    });

    it('una página exacta no promete más páginas', function () {
        newAnime('A');
        newAnime('B');
        newAnime('C');

        $page = syncOnce($this, limit: 3);

        expect($page['has_more'])->toBeFalse()
            ->and($page['animes'])->toHaveCount(3);
    });

    it('al llegar al final y volver a pedir no devuelve nada nuevo', function () {
        newAnime();
        $cursor = syncOnce($this)['cursor'];

        $page = syncOnce($this, $cursor);

        expect($page['cursor'])->toBe($cursor)
            ->and($page['animes'])->toBe([]);
    });
});

describe('borrados', function () {
    it('anota un episodio borrado y sus reproductores', function () {
        $server = newServer();
        $episode = newEpisode(newAnime(), 1);
        $players = [newPlayer($episode, $server, '0', 'a'), newPlayer($episode, $server, '1', 'b')];
        $cursor = syncOnce($this)['cursor'];

        $episode->delete();
        $page = syncOnce($this, $cursor);

        expect($page['deleted']['episodes'])->toBe([$episode->id])
            ->and($page['deleted']['players'])->toBe(collect($players)->pluck('id')->sort()->values()->all())
            ->and($page['episodes'])->toBe([]);
    });

    it('al borrar un anime anota sus episodios y reproductores', function () {
        $server = newServer();
        $anime = newAnime();
        $episode = newEpisode($anime);
        $player = newPlayer($episode, $server);
        $otro = newPlayer(newEpisode(newAnime('Otro')), $server, '0', 'ajeno');
        $cursor = syncOnce($this)['cursor'];

        $anime->delete();
        $page = syncOnce($this, $cursor);

        expect($page['deleted']['animes'])->toBe([$anime->id])
            ->and($page['deleted']['episodes'])->toBe([$episode->id])
            ->and($page['deleted']['players'])->toBe([$player->id])
            ->and($page['deleted']['players'])->not->toContain($otro->id);
    });

    it('al borrar un servidor anota sus reproductores', function () {
        $voe = newServer('Voe');
        $mega = newServer('Mega');
        $episode = newEpisode(newAnime());
        $enVoe = newPlayer($episode, $voe, '0', 'voe');
        $enMega = newPlayer($episode, $mega, '0', 'mega');
        $cursor = syncOnce($this)['cursor'];

        $voe->delete();
        $page = syncOnce($this, $cursor);

        expect($page['deleted']['servers'])->toBe([$voe->id])
            ->and($page['deleted']['players'])->toBe([$enVoe->id])
            ->and($page['deleted']['players'])->not->toContain($enMega->id);
    });

    it('un género borrado se anota', function () {
        $genre = Genre::create(['title' => 'Acción', 'slug' => 'accion']);
        $cursor = syncOnce($this)['cursor'];

        $genre->delete();

        expect(syncOnce($this, $cursor)['deleted']['genres'])->toBe([$genre->id]);
    });

    it('lo borrado a mano en la base se informa como borrado', function () {
        $player = newPlayer(newEpisode(newAnime()), newServer());
        DB::table('players')->where('id', $player->id)->delete();

        $page = syncOnce($this);

        expect($page['deleted']['players'])->toBe([$player->id])
            ->and($page['players'])->toBe([]);
    });

    it('una entidad borrada y creada de nuevo vuelve a aparecer', function () {
        $genre = Genre::create(['title' => 'Acción', 'slug' => 'accion']);
        $genre->delete();
        $cursor = lastChangeId();

        $nuevo = Genre::create(['title' => 'Acción', 'slug' => 'accion']);
        $page = syncOnce($this, $cursor);

        expect(collect($page['genres'])->pluck('id')->all())->toBe([$nuevo->id])
            ->and($page['deleted']['genres'])->toBe([]);
    });
});

describe('registro de cambios', function () {
    it('la migración siembra todo lo que ya existía', function () {
        Schema::drop('sync_changes');
        DB::table('animes')->insert(['name' => 'Viejo', 'slug' => 'viejo']);
        DB::table('genres')->insert(['title' => 'Drama', 'slug' => 'drama']);
        DB::table('servers')->insert(['title' => 'Voe', 'embed' => 'x']);
        DB::table('episodes')->insert(['anime_id' => 1, 'number' => 1]);
        DB::table('players')->insert(['episode_id' => 1, 'server_id' => 1, 'languaje' => '0', 'code' => 'c']);

        runSyncMigration();

        $counts = SyncChange::where('entity', '!=', 'reset')->pluck('entity_id', 'entity')->all();
        $page = syncOnce($this);

        expect($counts)->toEqual(['anime' => 1, 'genre' => 1, 'server' => 1, 'episode' => 1, 'player' => 1])
            ->and($page['animes'])->toHaveCount(1)
            ->and($page['players'])->toHaveCount(1);
    });

    it('la siembra deja las entidades en orden: animes, géneros, servidores, episodios, reproductores', function () {
        Schema::drop('sync_changes');
        DB::table('players')->insert(['episode_id' => 1, 'server_id' => 1, 'languaje' => '0', 'code' => 'c']);
        DB::table('episodes')->insert(['anime_id' => 1, 'number' => 1]);
        DB::table('animes')->insert(['name' => 'A', 'slug' => 'a']);
        DB::table('servers')->insert(['title' => 'Voe', 'embed' => 'x']);
        DB::table('genres')->insert(['title' => 'Drama', 'slug' => 'drama']);

        runSyncMigration();

        $order = SyncChange::where('entity', '!=', 'reset')->orderBy('id')->pluck('entity')->all();
        expect($order)->toBe(['anime', 'genre', 'server', 'episode', 'player']);
    });

    it('sync:rebuild reconstruye el registro', function () {
        newPlayer(newEpisode(newAnime()), newServer());
        SyncChange::query()->delete();

        $this->artisan('sync:rebuild')->expectsOutputToContain('4 entidades')->assertSuccessful();

        expect(SyncChange::where('entity', '!=', 'reset')->count())->toBe(4);
    });

    it('tras reconstruir, un cursor anterior recibe reset y todo de nuevo', function () {
        $anime = newAnime();
        $cursorViejo = syncOnce($this)['cursor'];
        $anime->delete();

        $this->artisan('sync:rebuild')->assertSuccessful();
        $page = syncOnce($this, $cursorViejo);

        expect($page['reset'])->toBeTrue()
            ->and($page['animes'])->toBe([]);

        newAnime('Nuevo');
        $this->artisan('sync:rebuild')->assertSuccessful();
        $desdeCero = syncOnce($this, 0);

        expect($desdeCero['reset'])->toBeFalse()
            ->and($desdeCero['animes'])->toHaveCount(1);
    });

    it('un cursor mayor al último cambio recibe reset y se reinicia desde cero', function () {
        newAnime();

        $page = syncOnce($this, 999999);

        expect($page['reset'])->toBeTrue()
            ->and($page['animes'])->toHaveCount(1);
    });

    it('la marca de reconstrucción no se confunde con una entidad', function () {
        $this->artisan('sync:rebuild')->assertSuccessful();

        $page = syncOnce($this);

        expect($page['animes'])->toBe([])
            ->and($page['deleted']['animes'])->toBe([]);
    });

    it('la ventana de espera oculta lo recién cambiado hasta que pasa el tiempo', function () {
        config(['sync.settle_seconds' => 60]);
        $anime = newAnime();

        $antes = syncOnce($this);
        expect($antes['animes'])->toBe([])->and($antes['cursor'])->toBe(0);

        $this->travel(61)->seconds();
        $despues = syncOnce($this);

        expect(collect($despues['animes'])->pluck('id')->all())->toBe([$anime->id]);
    });

    it('si el registro no existe todavía, guardar un anime no falla', function () {
        Schema::drop('sync_changes');

        $anime = newAnime('Sin registro');
        $episode = newEpisode($anime);
        newPlayer($episode, newServer());
        $episode->delete();
        $anime->delete();

        expect(Anime::count())->toBe(0)
            ->and(Player::count())->toBe(1);
    });

    it('registrar dos veces lo mismo deja una sola fila', function () {
        $recorder = app(SyncChangeRecorder::class);
        $recorder->record('anime', 99);
        $recorder->record('anime', 99);
        $recorder->recordMany('anime', [99, 99, 100]);

        expect(SyncChange::where('entity', 'anime')->count())->toBe(2);
    });
});
