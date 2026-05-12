<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserService
{
    public function getStats(): array
    {
        return [
            'total' => User::count(),
            'premium' => User::where('isPremium', true)->count(),
            'verified' => User::whereNotNull('email_verified_at')->count(),
            'recent' => User::where('created_at', '>=', now()->subDays(3))->count(),
        ];
    }

    public function getAllPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return User::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(isset($filters['isPremium']) && $filters['isPremium'] !== 'all', function ($query) use ($filters) {
                $query->where('isPremium', $filters['isPremium'] === '1');
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }

    public function togglePremium(User $user): User
    {
        $user->isPremium = !$user->isPremium;
        $user->save();

        return $user;
    }

    public function updatePassword(User $user, string $password): User
    {
        $user->password = \Illuminate\Support\Facades\Hash::make($password);
        $user->save();

        return $user;
    }

    public function updateEmail(User $user, string $email): User
    {
        $user->email = $email;
        $user->save();

        return $user;
    }
}
