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
        $frontendUrl = config('app.url');
        $configuredUrl = app(\App\Services\SettingsService::class)->get('frontend_url');

        if (!empty($configuredUrl)) {
            $frontendUrl = rtrim($configuredUrl, '/');
        }

        $url = $frontendUrl . '/reset-password/' . $token . '?email=' . $this->email;

        $this->notify(new \App\Notifications\ResetPasswordNotification($url));
    }
}
