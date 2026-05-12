<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\BroadcastsEvents;
use Illuminate\Broadcasting\Channel;

class Genre extends Model
{
    use BroadcastsEvents;

    protected $fillable = [
        'title',
        'slug',
        'name_mal',
    ];

    public function broadcastOn($event)
    {
        return [new Channel('admin.genres')];
    }
}
