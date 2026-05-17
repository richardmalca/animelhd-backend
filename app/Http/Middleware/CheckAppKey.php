<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAppKey
{
    public function handle(Request $request, Closure $next)
    {
        // Bypassed for now as requested
        return $next($request);

        $headerKey = $request->header('X-App-Key');
        $secretKey = env('X_APP_KEY', 'alhd_v1_4f8a2c1d9e3b7f5a0d6c2e8b1a4f9d7c3e5a0b2d6c1f8e9b3d7a5c4f2e1b0d9');

        if (!$headerKey || $headerKey !== $secretKey) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return $next($request);
    }
}
