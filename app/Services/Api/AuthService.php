<?php

namespace App\Services\Api;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AuthService
{
    public function sendResetLink(string $email)
    {
        $settingsFile = storage_path('app/settings.json');
        $settings = [];
        if (File::exists($settingsFile)) {
            $settings = json_decode(File::get($settingsFile), true);
        }

        if (empty($settings['frontend_url'])) {
            return ['status' => 'maintenance', 'message' => 'Servicio de recuperación no disponible por el momento.'];
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            Log::warning('Password recovery requested for non-existent email', ['email' => $email]);
            return ['status' => 'error', 'message' => 'El correo electrónico no está registrado.'];
        }

        try {
            $token = Password::createToken($user);
            $user->sendPasswordResetNotification($token);
            Log::info('Password reset email sent successfully', ['email' => $email]);
            return ['status' => 'success', 'message' => 'Enlace de recuperación enviado con éxito.'];
        } catch (\Exception $e) {
            Log::error('Error sending reset link email: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $email
            ]);
            return ['status' => 'error', 'message' => 'Error al enviar el correo de recuperación.'];
        }
    }

    public function validateToken(string $email, string $token)
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Password::getRepository()->exists($user, $token)) {
            return false;
        }

        return true;
    }

    public function resetPassword(array $data)
    {
        $status = Password::reset(
            $data,
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET;
    }
}
