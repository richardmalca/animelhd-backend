<?php

use App\Models\User;
use App\Services\Admin\UserService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

beforeEach(function (): void {
    Cache::flush();

    Schema::create('users', function (Blueprint $table): void {
        $table->id();
        $table->string('name')->unique();
        $table->string('email')->unique();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password')->default('');
        $table->boolean('isPremium')->default(false);
        $table->timestamps();
    });
});

function seedUser(string $name, string $email, bool $premium = false): int
{
    return DB::table('users')->insertGetId([
        'name' => $name,
        'email' => $email,
        'isPremium' => $premium,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

function searchNames(array $filters, int $perPage = 15): array
{
    return app(UserService::class)
        ->getAllPaginated($filters, $perPage)
        ->getCollection()
        ->pluck('name')
        ->all();
}

it('busca por el inicio del nombre o del correo sin distinguir mayúsculas', function (): void {
    seedUser('Juan_Perez', 'a@example.com');
    seedUser('maria', 'JUAN.lopez@example.com');
    seedUser('pedro', 'pedro@example.com');

    expect(searchNames(['search' => 'juan']))->toBe(['maria', 'Juan_Perez']);
});

it('no encuentra coincidencias en medio del texto', function (): void {
    seedUser('juan_perez', 'a@example.com');
    seedUser('pedro', 'pedro@gmail.com');

    expect(searchNames(['search' => 'perez']))->toBe([]);
    expect(searchNames(['search' => 'gmail']))->toBe([]);
});

it('trata los comodines como texto literal', function (): void {
    seedUser('abc_one', 'one@example.com');
    seedUser('abcdone', 'two@example.com');
    seedUser('50%off', 'three@example.com');
    seedUser('50xoff', 'four@example.com');

    expect(searchNames(['search' => 'abc_']))->toBe(['abc_one']);
    expect(searchNames(['search' => '50%']))->toBe(['50%off']);
    expect(searchNames(['search' => '%abc']))->toBe([]);
});

it('ignora las búsquedas de menos de 3 caracteres', function (): void {
    seedUser('ana', 'ana@example.com');
    seedUser('beto', 'beto@example.com');

    expect(searchNames(['search' => 'an']))->toBe(['beto', 'ana']);
    expect(searchNames(['search' => '  a ']))->toBe(['beto', 'ana']);
});

it('combina la búsqueda con el filtro de premium', function (): void {
    seedUser('juan_normal', 'n@example.com');
    seedUser('juan_premium', 'p@example.com', premium: true);
    seedUser('pedro', 'pedro@example.com', premium: true);

    $service = app(UserService::class);

    expect($service->getAllPaginated(['search' => 'juan', 'isPremium' => '1'])->pluck('name')->all())
        ->toBe(['juan_premium']);
    expect($service->getAllPaginated(['search' => 'juan', 'isPremium' => '1'])->total())->toBe(1);

    expect($service->getAllPaginated(['search' => 'juan', 'isPremium' => '0'])->pluck('name')->all())
        ->toBe(['juan_normal']);
    expect($service->getAllPaginated(['search' => 'juan', 'isPremium' => '0'])->total())->toBe(1);

    expect($service->getAllPaginated(['search' => 'juan', 'isPremium' => 'all'])->total())->toBe(2);
});

it('cuenta una sola vez a quien coincide por nombre y por correo', function (): void {
    seedUser('juan', 'juan@example.com');

    $result = app(UserService::class)->getAllPaginated(['search' => 'juan']);

    expect($result->total())->toBe(1);
    expect($result->getCollection())->toHaveCount(1);
});

it('pagina los resultados de la búsqueda de más nuevo a más viejo', function (): void {
    foreach (range(1, 7) as $number) {
        seedUser("juan{$number}", "user{$number}@example.com");
    }

    $first = app(UserService::class)->getAllPaginated(['search' => 'juan'], 3);

    expect($first->total())->toBe(7);
    expect($first->lastPage())->toBe(3);
    expect($first->getCollection()->pluck('name')->all())->toBe(['juan7', 'juan6', 'juan5']);

    request()->merge(['page' => 3]);

    $last = app(UserService::class)->getAllPaginated(['search' => 'juan'], 3);

    expect($last->getCollection()->pluck('name')->all())->toBe(['juan1']);
    expect($last->currentPage())->toBe(3);
});

it('devuelve una página vacía cuando nada coincide', function (): void {
    seedUser('pedro', 'pedro@example.com');

    $result = app(UserService::class)->getAllPaginated(['search' => 'zzzz']);

    expect($result->total())->toBe(0);
    expect($result->getCollection())->toBeEmpty();
});

it('lista sin búsqueda usando el total en caché', function (): void {
    seedUser('uno', 'uno@example.com');
    seedUser('dos', 'dos@example.com', premium: true);

    $service = app(UserService::class);

    expect($service->getAllPaginated([])->total())->toBe(2);
    expect($service->getAllPaginated(['isPremium' => '1'])->total())->toBe(1);
    expect($service->getAllPaginated(['isPremium' => '0'])->total())->toBe(1);

    seedUser('tres', 'tres@example.com');

    expect($service->getAllPaginated([])->total())->toBe(2);
    expect($service->getStats()['total'])->toBe(2);
});

it('refresca las estadísticas al cambiar premium o borrar', function (): void {
    $id = seedUser('uno', 'uno@example.com');
    seedUser('dos', 'dos@example.com');

    $service = app(UserService::class);

    expect($service->getStats())->toMatchArray(['total' => 2, 'premium' => 0]);

    $service->togglePremium(User::findOrFail($id));

    expect($service->getStats())->toMatchArray(['total' => 2, 'premium' => 1]);

    $service->delete(User::findOrFail($id));

    expect($service->getStats())->toMatchArray(['total' => 1, 'premium' => 0]);
});
