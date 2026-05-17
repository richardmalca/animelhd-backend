<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\AnimeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnimeController extends Controller
{
    protected AnimeService $animeService;

    public function __construct(AnimeService $animeService)
    {
        $this->animeService = $animeService;
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
