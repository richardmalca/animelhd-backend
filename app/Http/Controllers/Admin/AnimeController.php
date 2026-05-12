<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Anime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

use App\Services\Admin\TmdbService;
use App\Services\Admin\MalService;
use App\Services\Admin\AnimeService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Artisan;

class AnimeController extends Controller
{
    protected $tmdbService;
    protected $malService;
    protected $animeService;

    public function __construct(TmdbService $tmdbService, MalService $malService, AnimeService $animeService)
    {
        $this->tmdbService = $tmdbService;
        $this->malService = $malService;
        $this->animeService = $animeService;
    }

    public function malSearch(Request $request)
    {
        $request->validate(['query' => 'required|string|min:2']);
        
        try {
            $data = $this->malService->search($request->query('query'));
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function malDetails($malId)
    {
        try {
            $data = $this->malService->getDetails($malId);
            
            // Lógica de mapeo movida al backend
            $altTitles = [];
            if (isset($data['alternative_titles'])) {
                if (!empty($data['alternative_titles']['en'])) $altTitles[] = $data['alternative_titles']['en'];
                if (!empty($data['alternative_titles']['ja'])) $altTitles[] = $data['alternative_titles']['ja'];
                if (!empty($data['alternative_titles']['synonyms'])) {
                    $altTitles = array_merge($altTitles, $data['alternative_titles']['synonyms']);
                }
            }

            $genres = [];
            if (isset($data['genres'])) {
                foreach ($data['genres'] as $genre) {
                    $dbGenre = \App\Models\Genre::whereRaw('LOWER(TRIM(name_mal)) = ?', [strtolower(trim($genre['name']))])->first();
                    if ($dbGenre) {
                        $genres[] = $dbGenre->slug;
                    }
                }
            }

            $malGenresRaw = [];
            if (isset($data['genres'])) {
                foreach ($data['genres'] as $genre) {
                    $dbGenre = \App\Models\Genre::whereRaw('LOWER(TRIM(name_mal)) = ?', [strtolower(trim($genre['name']))])->first();
                    $malGenresRaw[] = [
                        'name' => $genre['name'],
                        'slug' => $dbGenre ? $dbGenre->slug : null
                    ];
                }
            }

            $mapped = [
                'name' => $data['title'] ?? '',
                'vote_average' => $data['mean'] ?? 0,
                'popularity' => $data['num_scoring_users'] ?? 0,
                'rating' => $data['rating'] ?? '',
                'premiered' => isset($data['start_season']) ? ucfirst($data['start_season']['season']) . ' ' . $data['start_season']['year'] : '',
                'altTitles' => array_values(array_unique($altTitles)),
                'mappedGenres' => array_values(array_unique($genres)),
                'malGenresRaw' => $malGenresRaw,
                'status' => $this->mapMalStatus($data['status'] ?? ''),
                'broadcast' => $this->mapMalBroadcast($data['broadcast']['day_of_the_week'] ?? ''),
            ];

            return response()->json($mapped);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function mapMalStatus($status)
    {
        return [
            'currently_airing' => 1,
            'finished_airing' => 0,
            'not_yet_aired' => 3,
        ][$status] ?? 1;
    }

    private function mapMalBroadcast($day)
    {
        return [
            'monday' => 1, 'tuesday' => 2, 'wednesday' => 3, 'thursday' => 4,
            'friday' => 5, 'saturday' => 6, 'sunday' => 7,
        ][$day] ?? 0;
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
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->input('type'), function ($query, $type) {
                $query->where('type', $type);
            })
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/animes/index', [
            'animes' => $animes,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    public function import()
    {
        return Inertia::render('admin/animes/import', [
            'hasApiKey' => !empty($this->tmdbService->getApiKey())
        ]);
    }

    public function tmdbSearch(Request $request)
    {
        $request->validate(['query' => 'required|string|min:2']);
        
        try {
            $data = $this->tmdbService->search($request->query('query'));
            
            if (isset($data['results'])) {
                $tmdbIds = collect($data['results'])->pluck('id')->filter()->toArray();
                
                $slugs = collect($data['results'])->map(function ($item) {
                    $name = $item['name'] ?? $item['title'] ?? '';
                    return Str::slug($name);
                })->filter()->toArray();

                $existingTmdbIds = Anime::whereIn('tmdb_id', $tmdbIds)->pluck('tmdb_id')->toArray();
                $existingSlugs = Anime::whereIn('slug', $slugs)->pluck('slug')->toArray();

                $data['results'] = collect($data['results'])->map(function ($item) use ($existingTmdbIds, $existingSlugs) {
                    $name = $item['name'] ?? $item['title'] ?? '';
                    $slug = Str::slug($name);
                    
                    $item['exists'] = in_array($item['id'], $existingTmdbIds) || in_array($slug, $existingSlugs);
                    return $item;
                });
            }

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function edit(Anime $anime)
    {
        $anime->rating = $this->normalizeRatingBackend($anime->rating);
        
        return Inertia::render('admin/animes/edit', [
            'anime' => $anime,
            'genres' => \App\Models\Genre::all(['title', 'slug'])
        ]);
    }

    private function normalizeRatingBackend(?string $rating): string
    {
        if (!$rating) return 'Selecciona una clasificación';

        $cleanRating = strtolower(trim($rating));

        if (str_contains($cleanRating, 'pg-13') || str_contains($cleanRating, 'pg_13') || str_contains($cleanRating, 'teens') || str_contains($cleanRating, 'mayores de 13')) {
            return 'Apto para mayores de 13 años';
        }

        if ($cleanRating === 'g' || str_contains($cleanRating, 'all ages') || str_contains($cleanRating, 'todos los públicos')) {
            return 'Apto para todos los públicos';
        }

        if ($cleanRating === 'pg' || str_contains($cleanRating, 'children') || str_contains($cleanRating, 'niños')) {
            return 'Apto para niños';
        }

        if ($cleanRating === 'r' || str_contains($cleanRating, '17+') || (str_contains($cleanRating, 'mayores de 17') && !str_contains($cleanRating, 'restringido'))) {
            return 'Apto para mayores de 17 años';
        }

        if ($cleanRating === 'r+' || str_contains($cleanRating, 'restringido') || str_contains($cleanRating, 'mild nudity')) {
            return 'Apto para mayores de 17 años (Restringido)';
        }

        if ($cleanRating === 'rx' || str_contains($cleanRating, 'hentai') || str_contains($cleanRating, 'adults') || str_contains($cleanRating, 'adultos')) {
            return 'Contenido para adultos';
        }

        return 'Selecciona una clasificación';
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

        return redirect()->route('admin.animes.index')->with('success', "{$anime->name} actualizado correctamente");
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
    public function checkSlug(Request $request)
    {
        $request->validate([
            'slug' => 'required|string',
            'exclude_id' => 'nullable|integer'
        ]);

        $slug = $request->slug;
        $excludeId = $request->exclude_id;
        
        $exists = Anime::where('slug', $slug)
            ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
            ->exists();

        if (!$exists) {
            return response()->json(['available' => true]);
        }

        $i = 2;
        $newSlug = $slug;
        while (Anime::where('slug', $newSlug . '-' . $i)->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))->exists()) {
            $i++;
        }

        return response()->json([
            'available' => false,
            'suggestion' => $slug . '-' . $i
        ]);
    }

    public function syncProgress()
    {
        return response()->json(\Illuminate\Support\Facades\Cache::get('anime_sync_progress', ['active' => false]));
    }

    public function stopSync()
    {
        \Illuminate\Support\Facades\Cache::put('anime_sync_stop', true, 60);
        return response()->json(['message' => 'Se ha enviado la señal de parada']);
    }

    public function syncAllMal()
    {
        Artisan::queue('anime:sync-all-mal');
        return back()->with('success', 'Se ha iniciado la sincronización masiva con MyAnimeList en segundo plano.');
    }

    public function destroy(Anime $anime)
    {
        $anime->delete();
        return redirect()->route('admin.animes.index');
    }
}
