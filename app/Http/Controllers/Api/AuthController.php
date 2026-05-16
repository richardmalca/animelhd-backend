<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\AuthService;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function forgotPassword(Request $request)
    {
        try {
            $request->validate(['email' => 'required|email']);
            
            $result = $this->authService->sendResetLink($request->email);

            if (isset($result['status']) && $result['status'] === 'maintenance') {
                return response()->json(['message' => $result['message']], 503);
            }

            return response()->json(['message' => $result['message']]);
        } catch (\Exception $e) {
            Log::error('Password recovery error: ' . $e->getMessage(), [
                'email' => $request->email,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Ocurrió un error inesperado al procesar la solicitud.'], 500);
        }
    }

    public function validateResetToken(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required|string',
                'email' => 'required|email',
            ]);

            $isValid = $this->authService->validateToken($request->email, $request->token);

            if (!$isValid) {
                return response()->json([
                    'message' => 'El enlace de recuperación no es válido o ha expirado.',
                    'valid' => false
                ], 422);
            }

            return response()->json([
                'message' => 'Token válido.',
                'valid' => true
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al validar el enlace.', 'valid' => false], 422);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required|string',
                'email' => 'required|email',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $success = $this->authService->resetPassword($request->only('email', 'password', 'password_confirmation', 'token'));

            if ($success) {
                return response()->json(['message' => 'Tu contraseña ha sido restablecida con éxito.']);
            }

            return response()->json([
                'message' => 'No se pudo restablecer la contraseña. El enlace podría haber expirado.'
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Ocurrió un error al intentar cambiar la contraseña.'], 500);
        }
    }
}
