<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Admin\UserService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'isPremium']);
        $users = $this->userService->getAllPaginated($filters);
        $stats = $this->userService->getStats();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $filters,
            'stats' => $stats,
        ]);
    }

    public function togglePremium(User $user)
    {
        $this->userService->togglePremium($user);
        $message = $user->isPremium ? 'Acceso Premium concedido' : 'Acceso Premium revocado';
        return back()->with('success', $message);
    }

    public function updatePassword(Request $request, User $user)
    {
        $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $this->userService->updatePassword($user, $request->password);

        return back()->with('success', "Contraseña de {$user->name} actualizada correctamente");
    }

    public function updateEmail(Request $request, User $user)
    {
        $request->validate([
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);

        $this->userService->updateEmail($user, $request->email);

        return back()->with('success', "Email de {$user->name} actualizado correctamente");
    }
}
