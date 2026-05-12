<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Server extends Model
{
    protected $fillable = [
        'title',
        'embed',
        'type',
        'status',
        'position',
        'show_on_web_desktop',
        'show_on_web_mobile',
        'show_on_app',
        'domains',
    ];

    protected $casts = [
        'domains' => 'json',
        'show_on_web_desktop' => 'boolean',
        'show_on_web_mobile' => 'boolean',
        'show_on_app' => 'boolean',
    ];

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }
}
