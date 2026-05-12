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
        $episodes = collect();
        try {
            $episodes = $this->animeService->getLatestEpisodes(18);
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
            'episodes' => $episodes,
            'animes' => $animes
        ]);
    }
}
