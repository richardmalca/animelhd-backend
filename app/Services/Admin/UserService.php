<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator as LengthAwarePaginatorContract;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public const SEARCH_MIN_LENGTH = 3;

    private const SEARCH_MAX_LENGTH = 100;

    private const STATS_CACHE_KEY = 'admin:users:stats';

    private const STATS_CACHE_SECONDS = 300;

    public function getStats(): array
    {
        return Cache::remember(self::STATS_CACHE_KEY, self::STATS_CACHE_SECONDS, fn (): array => [
            'total' => User::count(),
            'premium' => User::where('isPremium', true)->count(),
            'verified' => User::whereNotNull('email_verified_at')->count(),
            'recent' => User::where('created_at', '>=', now()->subDays(3))->count(),
        ]);
    }

    public function getAllPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginatorContract
    {
        $search = $this->normalizeSearch($filters['search'] ?? null);
        $isPremium = $this->premiumFilter($filters);

        if ($search === null) {
            return $this->paginateAll($isPremium, $perPage);
        }

        return $this->paginateSearch($search, $isPremium, $perPage);
    }

    public function delete(User $user): bool
    {
        $deleted = $user->delete();

        $this->forgetStats();

        return $deleted;
    }

    public function togglePremium(User $user): User
    {
        $user->isPremium = !$user->isPremium;
        $user->save();

        $this->forgetStats();

        return $user;
    }

    public function updatePassword(User $user, string $password): User
    {
        $user->password = Hash::make($password);
        $user->save();

        return $user;
    }

    public function updateEmail(User $user, string $email): User
    {
        $user->email = $email;
        $user->save();

        return $user;
    }

    private function paginateAll(?bool $isPremium, int $perPage): LengthAwarePaginator
    {
        $stats = $this->getStats();

        $total = match ($isPremium) {
            null => $stats['total'],
            true => $stats['premium'],
            false => max($stats['total'] - $stats['premium'], 0),
        };

        return User::query()
            ->when($isPremium !== null, fn ($query) => $query->where('isPremium', $isPremium))
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', null, $total)
            ->withQueryString();
    }

    private function paginateSearch(string $search, ?bool $isPremium, int $perPage): LengthAwarePaginator
    {
        $pattern = $this->escapeLike($search) . '%';

        $branch = fn (string $column): QueryBuilder => User::query()
            ->toBase()
            ->select('id')
            ->whereRaw("{$column} like ? escape '!'", [$pattern]);

        // Un UNION de dos rangos de índice evita que MySQL elija recorrer la clave primaria
        // al revés filtrando fila por fila, que con 1M de usuarios tarda segundos.
        $matches = User::query()
            ->toBase()
            ->fromSub($branch('name')->union($branch('email')), 'matches');

        // El filtro Premium se aplica después del UNION: dentro de cada rama cambia el plan
        // y el conteo pasa de milisegundos a más de 10 s.
        $premiumMatches = fn (bool $premium): QueryBuilder => (clone $matches)
            ->join('users', 'users.id', '=', 'matches.id')
            ->where('users.isPremium', $premium);

        $page = Paginator::resolveCurrentPage();

        $total = match ($isPremium) {
            null => $matches->count(),
            true => $premiumMatches(true)->count(),
            false => $matches->count() - $premiumMatches(true)->count(),
        };

        $pageQuery = $isPremium === null ? clone $matches : $premiumMatches($isPremium);

        $ids = $total === 0
            ? []
            : $pageQuery->orderByDesc('matches.id')->forPage($page, $perPage)->pluck('matches.id')->all();

        $users = $ids === []
            ? new EloquentCollection()
            : User::query()->whereIn('id', $ids)->orderByDesc('id')->get();

        return (new LengthAwarePaginator($users, $total, $perPage, $page, [
            'path' => Paginator::resolveCurrentPath(),
        ]))->withQueryString();
    }

    private function normalizeSearch(mixed $search): ?string
    {
        $term = trim((string) $search);

        if (mb_strlen($term) < self::SEARCH_MIN_LENGTH) {
            return null;
        }

        return mb_substr($term, 0, self::SEARCH_MAX_LENGTH);
    }

    private function premiumFilter(array $filters): ?bool
    {
        $value = $filters['isPremium'] ?? null;

        if ($value === null || $value === 'all') {
            return null;
        }

        return $value === '1';
    }

    private function escapeLike(string $value): string
    {
        return str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $value);
    }

    private function forgetStats(): void
    {
        Cache::forget(self::STATS_CACHE_KEY);
    }
}
