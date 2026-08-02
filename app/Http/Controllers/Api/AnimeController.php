<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\AnimeService;
use App\Services\Api\ViewCounterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnimeController extends Controller
{
    protected AnimeService $animeService;

    protected ViewCounterService $viewCounterService;

    public function __construct(AnimeService $animeService, ViewCounterService $viewCounterService)
    {
        $this->animeService = $animeService;
        $this->viewCounterService = $viewCounterService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['type', 'status', 'genre', 'search', 'year']);
        return response()->json($this->animeService->getAnimesPaginated($filters));
    }

    public function show(string $slug): JsonResponse
    {
        $data = $this->animeService->getAnimeBySlug($slug);
        if (!$data) {
            return response()->json(['message' => 'Anime not found'], 404);
        }
        $this->viewCounterService->incrementAnime($data['anime']['id']);
        return response()->json($data);
    }

    public function genres(): JsonResponse
    {
        return response()->json($this->animeService->getGenres());
    }

    public function years(): JsonResponse
    {
        return response()->json($this->animeService->getYears());
    }

    public function episode(string $slug, $number): JsonResponse
    {
        $data = $this->animeService->getEpisodeData($slug, (int) $number);
        if (!$data) {
            return response()->json(['message' => 'Episode not found'], 404);
        }
        $this->viewCounterService->incrementEpisode($data['episode']['id']);
        return response()->json($data);
    }

    public function latinos(): JsonResponse
    {
        return response()->json($this->animeService->getLatinosPaginated());
    }

    public function castellanos(): JsonResponse
    {
        return response()->json($this->animeService->getCastellanosPaginated());
    }
}
