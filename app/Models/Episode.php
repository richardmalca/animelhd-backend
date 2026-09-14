<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Redis;

class Episode extends Model
{
    protected $fillable = [
        'number',
        'views',
        'views_app',
        'anime_id',
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(Anime::class);
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    protected static function booted(): void
    {
        static::saved(function (Episode $episode): void {
            Redis::connection('shared')->set('episodes:last_id', $episode->id);
        });
    }
}
