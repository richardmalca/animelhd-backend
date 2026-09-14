<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Redis;

class Player extends Model
{
    protected $fillable = [
        'code',
        'languaje',
        'server_id',
        'episode_id',
        'code_backup',
    ];

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    protected static function booted(): void
    {
        static::saved(function (): void {
            Redis::connection('shared')->set('players:last_updated', now()->toDateTimeString());
        });

        static::deleted(function (): void {
            Redis::connection('shared')->set('players:last_updated', now()->toDateTimeString());
        });
    }
}
