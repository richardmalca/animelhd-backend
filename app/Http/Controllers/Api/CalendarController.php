<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\AnimeService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class CalendarController extends Controller
{
    protected AnimeService $animeService;

    public function __construct(AnimeService $animeService)
    {
        $this->animeService = $animeService;
    }

    public function index(): JsonResponse
    {
        try {
            return response()->json($this->animeService->getCalendarData());
        } catch (Exception $e) {
            Log::error('Error fetching calendar data: ' . $e->getMessage());
            return response()->json([]);
        }
    }
}
