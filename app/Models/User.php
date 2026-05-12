<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'isPremium',
        'point_kawaii',
        'last_point_earned_at',
        'image',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'isPremium' => 'boolean',
            'last_point_earned_at' => 'datetime',
        ];
    }

    public function sendPasswordResetNotification($token)
    {
        $settingsFile = storage_path('app/settings.json');
        $frontendUrl = config('app.url');

        if (file_exists($settingsFile)) {
            $settings = json_decode(file_get_contents($settingsFile), true);
            if (!empty($settings['frontend_url'])) {
                $frontendUrl = rtrim($settings['frontend_url'], '/');
            }
        }

        $url = $frontendUrl . '/reset-password/' . $token . '?email=' . $this->email;

        $this->notify(new \App\Notifications\ResetPasswordNotification($url));
    }
}
