<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Anime;
use App\Models\Episode;
use App\Models\Player;
use App\Services\Admin\PlayerService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlayerController extends Controller
{
    protected $playerService;

    public function __construct(PlayerService $playerService)
    {
        $this->playerService = $playerService;
    }

    public function index(Anime $anime, Episode $episode)
    {
        return Inertia::render('admin/players/index', [
            'anime' => $anime,
            'episode' => $episode,
            'players' => $this->playerService->getPlayersByEpisode($episode->id),
            'servers' => $this->playerService->getServers(),
        ]);
    }

    public function store(Request $request, Anime $anime, Episode $episode)
    {
        $validated = $request->validate([
            'server_id' => 'required|exists:servers,id',
            'code' => 'required|string',
            'languaje' => 'required|string',
            'code_backup' => 'nullable|string',
        ]);

        $validated['episode_id'] = $episode->id;

        $this->playerService->store($validated);

        return back();
    }

    public function update(Request $request, Anime $anime, Episode $episode, Player $player)
    {
        if ($player->episode_id !== $episode->id) {
            abort(403, 'Acceso no autorizado a este reproductor.');
        }

        $validated = $request->validate([
            'server_id' => 'required|exists:servers,id',
            'code' => 'required|string',
            'languaje' => 'required|string',
            'code_backup' => 'nullable|string',
        ]);

        $this->playerService->update($player, $validated);

        return back();
    }

    public function destroy(Anime $anime, Episode $episode, Player $player)
    {
        if ($player->episode_id !== $episode->id) {
            abort(403, 'Acceso no autorizado a este reproductor.');
        }

        $this->playerService->delete($player);

        return back();
    }
}
