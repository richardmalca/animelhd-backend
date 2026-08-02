<?php

namespace App\Services\Admin;

use App\Models\Server;
use Illuminate\Pagination\LengthAwarePaginator;

class ServerService
{
    public function getAllPaginated(array $filters = []): LengthAwarePaginator
    {
        return Server::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('embed', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();
    }

    public function store(array $data): Server
    {
        if (!empty($data['embed'])) {
            $data['embed'] = $this->extractBaseUrl($data['embed']);
        }

        $data = $this->ensureEmbedDomain($data);

        $server = Server::create($data);
        $this->clearCache();
        return $server;
    }

    public function update(Server $server, array $data): bool
    {
        if (!empty($data['embed'])) {
            $data['embed'] = $this->extractBaseUrl($data['embed']);
        }

        $data = $this->ensureEmbedDomain($data, $server->domains ?? []);

        $updated = $server->update($data);
        $this->clearCache();
        return $updated;
    }

    public function delete(Server $server): ?bool
    {
        $deleted = $server->delete();
        $this->clearCache();
        return $deleted;
    }

    private function clearCache(): void
    {
        \Illuminate\Support\Facades\Cache::tags(['home', 'episode-detail', 'anime-detail'])->flush();
    }

    private function extractBaseUrl(string $url): string
    {
        if (!preg_match('~^(?:f|ht)tps?://~i', $url)) {
            $url = "https://" . $url;
        }

        $parsed = parse_url($url);
        $scheme = $parsed['scheme'] ?? 'https';
        $host = $parsed['host'] ?? '';

        return "{$scheme}://{$host}";
    }

    private function ensureEmbedDomain(array $data, array $existingDomains = []): array
    {
        if (empty($data['embed'])) {
            return $data;
        }

        $host = strtolower(parse_url($data['embed'], PHP_URL_HOST) ?? '');
        $host = preg_replace('/^www\./', '', $host);

        if ($host === '') {
            return $data;
        }

        $short = explode('.', $host)[0];
        $domains = array_values(array_unique(array_merge($existingDomains, $data['domains'] ?? [])));

        foreach (array_unique([$short, $host]) as $domain) {
            if (!in_array($domain, $domains, true)) {
                $domains[] = $domain;
            }
        }

        $data['domains'] = array_values($domains);

        return $data;
    }
}
