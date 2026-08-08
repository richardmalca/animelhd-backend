<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAppKey
{
    public function handle(Request $request, Closure $next)
    {
        $headerKey = $request->header('X-App-Key');
        $secretKey = config('services.app_key_header.key');

        if (!$secretKey || !$headerKey || !hash_equals($secretKey, $headerKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return $next($request);
    }
}
