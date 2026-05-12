<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');

        if ($request->is('v/*')) {

            $allowedDomains = explode(',', env('ALLOWED_IFRAME_DOMAINS', ''));

            $origin = $request->headers->get('origin');
            $referer = $request->headers->get('referer');

            $valid = false;

            foreach ($allowedDomains as $domain) {
                $domain = trim($domain);

                if (
                    ($origin && str_starts_with($origin, $domain)) ||
                    ($referer && str_starts_with($referer, $domain))
                ) {
                    $valid = true;
                }
            }

            if (!$valid) {
                abort(403);
            }

            $response->headers->set(
                'Content-Security-Policy',
                "frame-ancestors " . implode(' ', $allowedDomains)
            );

            $response->headers->remove('X-Frame-Options');

        } else {
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        }

        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}