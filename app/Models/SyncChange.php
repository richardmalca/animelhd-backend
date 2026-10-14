<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Una fila por entidad sincronizable. `id` es el cursor de GET /api/sync.
 */
class SyncChange extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'entity',
        'entity_id',
        'deleted',
        'created_at',
    ];

    protected $casts = [
        'deleted' => 'boolean',
        'created_at' => 'datetime',
    ];
}
