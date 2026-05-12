<?php

namespace App\Services\Admin;

use App\Models\Anime;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\Player;
use App\Models\Server;
use App\Models\User;
use Carbon\Carbon;

class DashboardService
{
    public function getStats(): array
    {
        $startOfWeek = Carbon::now()->startOfWeek();

        return [
            'animes' => [
                'total' => Anime::count(),
                'this_week' => Anime::where('created_at', '>=', $startOfWeek)->count(),
            ],
            'episodes' => [
                'total' => Episode::count(),
                'this_week' => Episode::where('created_at', '>=', $startOfWeek)->count(),
            ],
            'players' => [
                'total' => Player::count(),
                'this_week' => Player::where('created_at', '>=', $startOfWeek)->count(),
            ],
            'genres' => [
                'total' => Genre::count(),
                'this_week' => Genre::where('created_at', '>=', $startOfWeek)->count(),
            ],
            'users' => [
                'total' => User::count(),
                'this_week' => User::where('created_at', '>=', $startOfWeek)->count(),
            ],
            'servers' => [
                'total' => Server::count(),
                'this_week' => Server::where('created_at', '>=', $startOfWeek)->count(),
            ],
            'recent_animes' => Anime::latest()->take(5)->get(['id', 'name', 'slug', 'poster', 'created_at']),
            'recent_episodes' => Episode::with('anime:id,name')->latest()->take(5)->get(['id', 'anime_id', 'number', 'created_at']),
        ];
    }
}
