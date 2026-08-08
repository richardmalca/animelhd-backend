<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Anime;
use App\Models\Genre;
use App\Services\Admin\AnimeService;
use App\Services\Admin\MalService;
use App\Services\Admin\TmdbService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AnimeController extends Controller
{
    public function __construct(
        protected TmdbService $tmdbService,
        protected MalService $malService,
        protected AnimeService $animeService,
    ) {
    }

    public function index(Request $request)
    {
        $animes = Anime::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    foreach (explode(' ', $search) as $word) {
                        $q->where(function ($sq) use ($word) {
                            $sq->where('name', 'like', "%{$word}%")
                               ->orWhere('name_alternative', 'like', "%{$word}%");
                        });
                    }
                });
            })
            ->when($request->input('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->input('type'), fn ($query, $type) => $query->where('type', $type))
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/animes/index', [
            'animes' => $animes,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    public function edit(Anime $anime)
    {
        $anime->rating = $this->animeService->normalizeRatingForDisplay($anime->rating);

        return Inertia::render('admin/animes/edit/index', [
            'anime' => $anime,
            'genres' => Genre::all(['title', 'slug']),
        ]);
    }

    public function update(Request $request, Anime $anime)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_alternative' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:animes,slug,' . $anime->id,
            'overview' => 'nullable|string',
            'genres' => 'nullable|string',
            'rating' => 'nullable|string',
            'premiered' => 'nullable|string',
            'popularity' => 'nullable|numeric',
            'broadcast' => 'nullable|integer',
            'type' => 'required|string',
            'status' => 'required|integer',
            'aired' => 'nullable|date',
            'tmdb_id' => 'nullable|integer',
            'mal_id' => 'nullable|integer',
            'vote_average' => 'nullable|numeric',
            'poster' => 'nullable|string',
            'banner' => 'nullable|string',
            'short_name' => 'nullable|string|max:255',
            'slug_tio' => 'nullable|string|max:255',
            'active_tio' => 'nullable|boolean',
        ]);

        $anime->update($validated);
        $this->animeService->clearCache();

        return redirect()->route('admin.animes.index')->with('success', "{$anime->name} actualizado correctamente");
    }

    public function destroy(Anime $anime)
    {
        $anime->delete();
        $this->animeService->clearCache();

        return redirect()->route('admin.animes.index');
    }

    public function checkSlug(Request $request)
    {
        $request->validate([
            'slug' => 'required|string',
            'exclude_id' => 'nullable|integer',
        ]);

        $exists = Anime::where('slug', $request->slug)
            ->when($request->exclude_id, fn ($q) => $q->where('id', '!=', $request->exclude_id))
            ->exists();

        if (!$exists) {
            return response()->json(['available' => true]);
        }

        return response()->json([
            'available' => false,
            'suggestion' => $this->animeService->generateUniqueSlug($request->slug, $request->exclude_id),
        ]);
    }

    public function import()
    {
        return Inertia::render('admin/animes/import', [
            'hasApiKey' => !empty($this->tmdbService->getApiKey()),
        ]);
    }

    public function tmdbSearch(Request $request)
    {
        $request->validate(['query' => 'required|string|min:2']);

        try {
            $data = $this->tmdbService->search($request->query('query'));

            if (isset($data['results'])) {
                $data['results'] = $this->animeService->markExistingTmdbResults($data['results']);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function storeFromTmdb(Request $request)
    {
        $request->validate([
            'tmdb_id' => 'required|integer',
            'media_type' => 'required|string|in:tv,movie',
        ]);

        try {
            $data = $this->tmdbService->getDetails($request->tmdb_id, $request->media_type);
            $anime = $this->animeService->createFromTmdbData($data, $request->media_type, $request->tmdb_id);

            return back()->with('success', "{$anime->name} importado correctamente");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function sync(Anime $anime)
    {
        if (!$anime->tmdb_id) {
            return back()->withErrors(['error' => 'Este anime no tiene un ID de TMDB vinculado']);
        }

        try {
            $tmdbType = $anime->type === 'Movie' ? 'movie' : 'tv';
            $data = $this->tmdbService->getDetails($anime->tmdb_id, $tmdbType);
            $this->animeService->updateFromTmdbData($anime, $data);

            return back()->with('success', "{$anime->name} sincronizado correctamente con TMDB");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function malSearch(Request $request)
    {
        $request->validate(['query' => 'required|string|min:2']);

        try {
            return response()->json($this->malService->search($request->query('query')));
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function malDetails($malId)
    {
        try {
            $data = $this->malService->getDetails($malId);

            return response()->json($this->animeService->mapMalPreview($data));
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function malSync(Anime $anime)
    {
        if (!$anime->mal_id) {
            return back()->withErrors(['error' => 'Este anime no tiene un ID de MyAnimeList vinculado']);
        }

        try {
            $data = $this->malService->getDetails($anime->mal_id);
            $this->animeService->updateFromMalData($anime, $data);

            return back()->with('success', "{$anime->name} sincronizado correctamente con MyAnimeList");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function syncAllMal()
    {
        $progress = Cache::get('anime_sync_progress', ['active' => false]);

        if (!empty($progress['active'])) {
            return back()->withErrors(['error' => 'Ya hay una sincronización masiva en curso.']);
        }

        Cache::forget('anime_sync_stop');
        Cache::put('anime_sync_progress', [
            'active' => true,
            'current' => 0,
            'total' => 0,
            'last_anime' => null,
            'updated_at' => now()->timestamp,
        ], 3600);

        Artisan::queue('anime:sync-all-mal');

        return back()->with('success', 'Se ha iniciado la sincronización masiva con MyAnimeList en segundo plano.');
    }

    /**
     * Cuánto puede pasar sin heartbeat antes de considerar el job "muerto"
     * (worker caído, servidor reiniciado, etc.) en vez de simplemente lento.
     */
    protected const SYNC_STALE_SECONDS = 30;

    public function syncProgress()
    {
        $progress = Cache::get('anime_sync_progress', ['active' => false]);

        if (!empty($progress['active']) && isset($progress['updated_at'])) {
            $secondsSinceHeartbeat = now()->timestamp - $progress['updated_at'];

            if ($secondsSinceHeartbeat > self::SYNC_STALE_SECONDS) {
                Cache::forget('anime_sync_progress');
                $progress = ['active' => false, 'stale' => true];
            }
        }

        return response()->json($progress);
    }

    public function stopSync()
    {
        Cache::put('anime_sync_stop', true, 60);

        return response()->json(['message' => 'Se ha enviado la señal de parada']);
    }
}
