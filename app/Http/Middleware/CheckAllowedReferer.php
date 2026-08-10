<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckAllowedReferer
{
    /**
     * Exige que el Referer del request tenga un host presente en la
     * whitelist configurada en config/services.php bajo la clave dada.
     * Bloquea acceso directo (curl, scraping) y llamadas desde otros
     * orígenes. Pensado para endpoints que solo debe consumir un
     * frontend propio desde navegador (no aplica a apps nativas, que
     * no mandan Referer).
     *
     * Uso: ->middleware('referer.whitelist:auth_api')
     */
    public function handle(Request $request, Closure $next, string $configKey)
    {
        $allowedHosts = config("services.referer_whitelists.{$configKey}", []);

        if (empty($allowedHosts)) {
            // Sin whitelist configurada, no bloqueamos (evita romper el
            // sitio si falta la env var).
            return $next($request);
        }

        $referer = $request->header('referer');
        $refererHost = $referer ? parse_url($referer, PHP_URL_HOST) : null;

        if (!$refererHost || !in_array($refererHost, $allowedHosts, true)) {
            Log::warning('CheckAllowedReferer: acceso rechazado', [
                'config_key' => $configKey,
                'referer' => $referer,
                'ip' => $request->ip(),
                'path' => $request->path(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Acceso no permitido desde este origen.',
            ], 403);
        }

        return $next($request);
    }
}
