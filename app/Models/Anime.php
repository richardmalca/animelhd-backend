<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Anime extends Model
{
    protected $table = 'animes';

    protected $fillable = [
        'name',
        'name_alternative',
        'slug',
        'overview',
        'poster',
        'banner',
        'aired',
        'type',
        'status',
        'premiered',
        'broadcast',
        'airing',
        'genres',
        'vote_average',
        'prequel',
        'sequel',
        'related',
        'views',
        'views_app',
        'isTopic',
        'mal_id',
        'tmdb_id',
        'short_name',
        'rating',
        'popularity',
        'trailer',
    ];

    public function episodes(): HasMany
    {
        return $this->hasMany(Episode::class);
    }
}
