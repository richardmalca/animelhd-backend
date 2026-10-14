<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Sync\SyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function __construct(private readonly SyncService $service) {}

    /**
     * Cambios (animes, géneros, servidores, episodios y reproductores) desde un cursor.
     *
     * La app empieza con cursor 0 y repite la petición con el `cursor` recibido mientras `has_more`
     * sea true. Después le basta con volver a pedir con el último cursor para recibir solo novedades.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cursor' => ['sometimes', 'integer', 'min:0'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:'.config('sync.max_limit')],
        ]);

        $page = $this->service->page(
            cursor: (int) ($validated['cursor'] ?? 0),
            limit: (int) ($validated['limit'] ?? config('sync.default_limit')),
        );

        return response()->json($page)->header('Cache-Control', 'no-store');
    }
}
