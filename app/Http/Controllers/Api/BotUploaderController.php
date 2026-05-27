<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\BotUploaderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BotUploaderController extends Controller
{
    protected BotUploaderService $botService;

    public function __construct(BotUploaderService $botService)
    {
        $this->botService = $botService;
    }

    public function list(): JsonResponse
    {
        return response()->json($this->botService->getTioActiveAiringAnimes());
    }

    public function insert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'anime_id' => 'required|integer|exists:animes,id',
            'number' => 'required|integer',
            'players' => 'required|array',
            'players.*.server_id' => 'required|integer|exists:servers,id',
            'players.*.code' => 'required|string',
            'players.*.language' => 'required|string',
        ]);

        $result = $this->botService->uploadEpisodeWithPlayers($validated);

        return response()->json($result);
    }
}
