<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class PlayerController extends Controller
{
    public function show(Request $request, string $slug, ?string $token = null)
    {
        if ($token === null) {
            $token = $slug;
        }

        if (!$this->hasAllowedReferer($request)) {
            Log::warning('player.bridge: acceso rechazado por Referer inválido', [
                'referer' => $request->header('referer'),
                'ip' => $request->ip(),
                'slug' => $slug,
            ]);

            abort(403, 'Acceso no permitido desde este origen.');
        }

        try {
            $decrypted = Crypt::decryptString($token);
            list($playerId, $timestamp) = explode('|', $decrypted);

            if (time() - $timestamp > 14400) {
                return response('El enlace ha expirado.', 403);
            }

            $player = Player::with('server')->findOrFail($playerId);

            if (str_starts_with($player->code, 'http')) {
                $url = $player->code;
            } else {
                $server = $player->server;
                $baseUrl = $server->embed;

                if (!str_starts_with($baseUrl, 'http')) {
                    $baseUrl = 'https://' . ltrim($baseUrl, '/');
                }
                $baseUrl = rtrim($baseUrl, '/');

                if (str_contains($baseUrl, '%%code%%')) {
                    $url = str_replace('%%code%%', $player->code, $baseUrl);
                } else {
                    $url = "{$baseUrl}/e/{$player->code}";
                }
            }

            return view('player', ['url' => $url]);
        } catch (\Exception $e) {
            abort(404);
        }
    }

    /**
     * Solo permite cargar el bridge cuando viene embebido (iframe) desde uno de
     * los dominios propios. Bloquea acceso directo (link pegado, curl, scraping)
     * y que otros sitios lo empotren, ya que ninguno de esos casos manda un
     * Referer con un host de la whitelist.
     */
    protected function hasAllowedReferer(Request $request): bool
    {
        $allowedHosts = config('services.player_bridge.allowed_hosts', []);

        if (empty($allowedHosts)) {
            // Sin whitelist configurada, no bloqueamos (evita dejar el sitio
            // roto si falta la env var); quedará documentado en .env.example.
            return true;
        }

        $referer = $request->header('referer');

        if (!$referer) {
            return false;
        }

        $refererHost = parse_url($referer, PHP_URL_HOST);

        return $refererHost !== null && in_array($refererHost, $allowedHosts, true);
    }
}
