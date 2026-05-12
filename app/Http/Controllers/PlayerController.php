<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class PlayerController extends Controller
{
    public function show(Request $request, string $slug, ?string $token = null)
    {
        if ($token === null) {
            $token = $slug;
        }

        try {
            $decrypted = Crypt::decryptString($token);
            list($playerId, $timestamp) = explode('|', $decrypted);

            if (time() - $timestamp > 14400) {
                return response('El enlace ha expirado.', 403);
            }

            $referer = $request->headers->get('referer');
            $allowedDomain = parse_url(config('app.url'), PHP_URL_HOST);
            
            if ($referer) {
                $refererHost = parse_url($referer, PHP_URL_HOST);
                // Permitimos localhost y 127.0.0.1 con cualquier puerto para desarrollo
                $isLocal = str_contains($refererHost, 'localhost') || str_contains($refererHost, '127.0.0.1');
                
                if ($refererHost !== $allowedDomain && !$isLocal) {
                    return response('Acceso no autorizado.', 403);
                }
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
}
