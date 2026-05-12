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
            $envDomains = env('ALLOWED_IFRAME_DOMAINS', '');
            $allowedDomains = !empty($envDomains) ? explode(',', $envDomains) : [];
            $allowedDomains = array_map('trim', $allowedDomains);

            $rawReferer = $request->headers->get('referer') ?? $request->headers->get('origin');
            $requestHost = parse_url($rawReferer, PHP_URL_HOST);

            $valid = false;

            if ($requestHost) {
                foreach ($allowedDomains as $domain) {
                    $domainHost = parse_url($domain, PHP_URL_HOST) ?? $domain;
                    if ($requestHost === $domainHost) {
                        $valid = true;
                        break;
                    }
                }
            }

            if (!$valid) {
                abort(403);
            }

            $response->headers->set('Content-Security-Policy', "frame-ancestors " . implode(' ', $allowedDomains));
            $response->headers->remove('X-Frame-Options');

        } else {
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        }

        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'no-referrer-when-downgrade');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}