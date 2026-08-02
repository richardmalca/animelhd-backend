<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\AnimeSyncService;
use Illuminate\Http\JsonResponse;

class AnimeSyncController extends Controller
{
    public function __construct(protected AnimeSyncService $animeSyncService)
    {
    }

    public function version(): JsonResponse
    {
        return response()->json($this->animeSyncService->getVersion());
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'version' => $this->animeSyncService->getVersion()['version'],
            'animes' => $this->animeSyncService->getAnimeList(),
        ]);
    }
}
