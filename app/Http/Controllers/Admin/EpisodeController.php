<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Episode;
use App\Models\Anime;
use App\Models\Server;
use App\Services\Admin\EpisodeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EpisodeController extends Controller
{
    protected $episodeService;

    public function __construct(EpisodeService $episodeService)
    {
        $this->episodeService = $episodeService;
    }

    public function animeEpisodes(Anime $anime)
    {
        return Inertia::render('admin/episodes/index', [
            'anime' => $anime,
            'episodes' => $anime->episodes()->orderBy('number', 'desc')->paginate(10),
            'animes' => [$anime->only('id', 'name')]
        ]);
    }

    public function index()
    {
        return Inertia::render('admin/episodes/index', [
            'episodes' => $this->episodeService->getEpisodes(),
            'animes' => Anime::select('id', 'name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|numeric',
            'anime_id' => 'required|exists:animes,id',
        ]);

        $this->episodeService->createEpisode($validated);
        return back();
    }

    public function update(Request $request, Episode $episode)
    {
        $validated = $request->validate([
            'number' => 'required|numeric',
            'anime_id' => 'required|exists:animes,id',
        ]);

        $this->episodeService->updateEpisode($episode, $validated);
        return back();
    }

    public function destroy(Episode $episode)
    {
        $this->episodeService->deleteEpisode($episode);
        return back();
    }

    public function bulkSync(Request $request, Anime $anime)
    {
        $request->validate([
            'count' => 'required|integer|min:1|max:2000'
        ]);

        $this->episodeService->bulkSync($anime, $request->count);

        return back()->with('success', "Sincronizados {$request->count} episodios para {$anime->name}");
    }

    public function importForm(Anime $anime)
    {
        return Inertia::render('admin/episodes/import', [
            'anime' => $anime,
            'servers' => Server::where('status', 1)->orderBy('position')->get()
        ]);
    }

    public function importStore(Request $request, Anime $anime)
    {
        $request->validate([
            'start_number' => 'required|integer|min:0|max:2000',
            'players' => 'required|string'
        ]);

        $this->episodeService->bulkImportWithPlayers($anime, $request->all());

        return redirect()->route('admin.animes.episodes', $anime->id)
            ->with('success', 'Importación masiva completada correctamente');
    }
}
