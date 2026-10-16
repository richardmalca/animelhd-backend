<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Sync\SyncPageCache;
use App\Services\Sync\SyncReconciler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function __construct(
        private readonly SyncPageCache $pages,
        private readonly SyncReconciler $reconciler,
    ) {}

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

        // Anota lo que otras apps escribieron en la base de datos sin pasar por los observers (como mucho una vez
        // por minuto; nunca impide responder).
        $this->reconciler->reconcileIfDue();

        $page = $this->pages->page(
            cursor: (int) ($validated['cursor'] ?? 0),
            limit: (int) ($validated['limit'] ?? config('sync.default_limit')),
        );

        // Servidor saturado y sin turno a tiempo: la app reintenta en unos segundos en vez de apilarse.
        if ($page === null) {
            return response()
                ->json(['message' => 'Servidor ocupado, reintenta en unos segundos.'], 503)
                ->header('Retry-After', (string) random_int(2, 6))
                ->header('Cache-Control', 'no-store');
        }

        return response()->json($page)->header('Cache-Control', 'no-store');
    }
}
