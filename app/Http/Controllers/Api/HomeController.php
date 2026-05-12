<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\AnimeService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class HomeController extends Controller
{
    protected AnimeService $animeService;

    public function __construct(AnimeService $animeService)
    {
        $this->animeService = $animeService;
    }

    public function index(): JsonResponse
    {
        $hero = null;
        try {
            $hero = $this->animeService->getHeroAnime();
        } catch (Exception $e) {
            Log::error('Error fetching hero anime: ' . $e->getMessage());
        }

        $episodes = collect();
        try {
            $episodes = $this->animeService->getLatestEpisodes(12);
        } catch (Exception $e) {
            Log::error('Error fetching latest episodes: ' . $e->getMessage());
        }

        $animes = collect();
        try {
            $animes = $this->animeService->getLatestAnimes(14);
        } catch (Exception $e) {
            Log::error('Error fetching latest animes: ' . $e->getMessage());
        }

        return response()->json([
            'hero' => $hero,
            'episodes' => $episodes,
            'animes' => $animes
        ]);
    }
}
