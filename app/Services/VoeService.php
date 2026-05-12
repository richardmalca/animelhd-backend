<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VoeService
{
    protected string $baseUrl = 'https://voe.sx';

    /**
     * Attempt to login to VOE and return the session cookie.
     */
    public function login(string $email, string $password): ?string
    {
        try {
            $ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
            
            // 1. GET initial cookies and token
            $response = Http::withHeaders(['User-Agent' => $ua])->get("{$this->baseUrl}/login");
            if (!$response->successful()) return null;

            // Map cookies to simple key-value for the next request
            $initialCookies = [];
            foreach ($response->cookies()->toArray() as $cookie) {
                $initialCookies[$cookie['Name']] = $cookie['Value'];
            }

            $html = $response->body();
            if (!preg_match('/name="_token" value="([^"]+)"/', $html, $matches)) {
                if (!preg_match('/_token" value="([^"]+)"/', $html, $matches)) return null;
            }
            $token = $matches[1];

            // 2. POST Login carrying initial cookies
            $loginResponse = Http::withHeaders([
                'User-Agent' => $ua,
                'Referer' => "{$this->baseUrl}/login",
            ])->withCookies($initialCookies, 'voe.sx')
            ->asForm()->post("{$this->baseUrl}/login", [
                '_token' => $token,
                'email' => $email,
                'password' => $password,
                'remember' => '1'
            ]);

            if ($loginResponse->failed()) return null;

            // 3. CAPTURE ALL COOKIES (including security ones)
            $cookieString = '';
            foreach ($loginResponse->cookies()->toArray() as $cookie) {
                $cookieString .= $cookie['Name'] . '=' . $cookie['Value'] . '; ';
            }
            $cookieString = trim($cookieString, '; ');

            if (empty($cookieString)) return null;

            Log::info("VOE Login Successful. Captured cookies: " . $cookieString);
            
            return $cookieString;
        } catch (\Exception $e) {
            Log::error("VOE Login Error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Verify if the current session is active.
     */
    public function verifySession(string $cookie): bool
    {
        try {
            $cookieMap = [];
            foreach (explode(';', $cookie) as $part) {
                $pair = explode('=', trim($part), 2);
                if (count($pair) == 2) $cookieMap[$pair[0]] = $pair[1];
            }

            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            ])->withCookies($cookieMap, 'voe.sx')
            ->get("{$this->baseUrl}/settings");

            $html = $response->body();
            
            // If redirected to login, session is invalid
            if ($response->status() === 302 || str_contains($response->url(), '/login')) {
                return false;
            }

            // Check for profile indicators
            return str_contains($html, 'logout') || str_contains($html, 'Account') || str_contains($html, 'Settings');
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Extract direct 720p download link from VOE page with auto-retry and silent renewal.
     */
    public function getDirectDownloadLink(string $url, string $cookie, int $attempt = 1): ?string
    {
        try {
            // Ensure we have the download URL
            $downloadUrl = $url;
            if (!str_ends_with($downloadUrl, '/download')) {
                $downloadUrl = rtrim($downloadUrl, '/') . '/download';
            }

            $cookieMap = [];
            foreach (explode(';', $cookie) as $part) {
                $pair = explode('=', trim($part), 2);
                if (count($pair) == 2) $cookieMap[$pair[0]] = $pair[1];
            }

            $settings = json_decode(@file_get_contents(storage_path('app/settings.json')), true);
            $permToken = $settings['voe_permanent_token'] ?? null;
            
            $finalUrl = $downloadUrl;
            if ($permToken) {
                $finalUrl .= (str_contains($finalUrl, '?') ? '&' : '?') . 'permanentToken=' . $permToken;
            }

            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Upgrade-Insecure-Requests' => '1',
            ])->withCookies($cookieMap, 'voe.sx')
            ->get($finalUrl);

            $html = $response->body();

            // Detect if we are logged out or blocked
            $isLoggedOut = str_contains($html, 'login') && !str_contains($html, 'logout');
            $isBlocked = str_contains($html, 'Server overloaded');

            if (($isLoggedOut || $isBlocked) && $attempt < 2) {
                Log::info("VOE Session expired or blocked. Attempting silent renewal...");
                
                $email = $settings['voe_email'] ?? null;
                $password = $settings['voe_password'] ?? null;

                if ($email && $password) {
                    $newCookie = $this->login($email, $password);
                    if ($newCookie) {
                        // Save new cookie to settings.json
                        $settings['voe_session_cookie'] = $newCookie;
                        file_put_contents(storage_path('app/settings.json'), json_encode($settings, JSON_PRETTY_PRINT));
                        
                        Log::info("VOE Session renewed successfully. Retrying extraction...");
                        return $this->getDirectDownloadLink($url, $newCookie, $attempt + 1);
                    }
                }
            }

            // Standard extraction logic
            if (str_contains($html, 'Redirecting...') && !$permToken) {
                if (preg_match('/window\.location\.href\s*=\s*[\'"](https:\/\/[^\'"]+)[\'"]/', $html, $urlMatches)) {
                    $targetUrl = $urlMatches[1];
                    $response = Http::withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Referer' => $downloadUrl
                    ])->withCookies($cookieMap, parse_url($targetUrl, PHP_URL_HOST))
                    ->get($targetUrl);
                    $html = $response->body();
                }
            }

            if (preg_match('/<a[^>]+href="([^"]+)"[^>]*>(?:(?!<\/a>)[\s\S])*?720p/i', $html, $matches)) {
                return $matches[1];
            }

            if (preg_match('/<a[^>]+href="([^"]+)"[^>]*class="[^"]*btn-secondary[^"]*"[^>]*>/i', $html, $matches)) {
                return $matches[1];
            }

            return null;
        } catch (\Exception $e) {
            Log::error("VOE Extraction Error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Remove metadata from video file using FFmpeg
     */
    public function removeMetadata(string $inputPath, string $outputPath): bool
    {
        try {
            $process = new \Symfony\Component\Process\Process([
                'ffmpeg', '-y', '-i', $inputPath, '-map_metadata', '-1', '-c', 'copy', $outputPath
            ]);
            $process->setTimeout(300); // 5 minutes
            $process->run();

            if (!$process->isSuccessful()) {
                \Log::error("FFmpeg Error: " . $process->getErrorOutput());
                return false;
            }

            return true;
        } catch (\Exception $e) {
            \Log::error("FFmpeg Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Upload file to VOE using API Key
     */
    public function uploadFile(string $filePath, string $apiKey): ?array
    {
        try {
            // Step 1: Get upload server
            $serverResp = Http::timeout(60)->get("https://voe.sx/api/upload/server", [
                'key' => $apiKey
            ]);

            if (!$serverResp->successful() || !$serverResp->json('success')) {
                \Log::error("VOE API Upload Server Error: " . $serverResp->body());
                return null;
            }

            $uploadUrl = $serverResp->json('result');

            // Step 2: Upload file
            $uploadResp = Http::timeout(1200)
                ->asMultipart()
                ->attach('file', fopen($filePath, 'r'), basename($filePath))
                ->post($uploadUrl, [
                    'key' => $apiKey
                ]);

            if (!$uploadResp->successful() || !$uploadResp->json('success')) {
                \Log::error("VOE API Upload Error: " . $uploadResp->body());
                return null;
            }

            return $uploadResp->json('file');
        } catch (\Exception $e) {
            \Log::error("VOE API Upload Exception: " . $e->getMessage());
            return null;
        }
    }
}
