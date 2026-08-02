<?php

namespace App\Services\Admin;

use App\Models\Anime;
use App\Models\Genre;
use App\Support\MalMapper;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class AnimeService
{
    public function createFromTmdbData(array $data, string $mediaType, int $tmdbId): Anime
    {
        $name = $data['name'] ?? $data['title'];
        $slug = $this->generateUniqueSlug(Str::slug($name));

        $anime = Anime::create([
            'name' => $name,
            'name_alternative' => $data['original_name'] ?? $data['original_title'] ?? null,
            'slug' => $slug,
            'overview' => $data['overview'] ?? '',
            'poster' => $data['poster_path'] ?? null,
            'banner' => $data['backdrop_path'] ?? null,
            'aired' => $data['first_air_date'] ?? $data['release_date'] ?? null,
            'type' => $mediaType === 'tv' ? 'TV' : 'Movie',
            'status' => 1,
            'tmdb_id' => $tmdbId,
            'vote_average' => $data['vote_average'] ?? 0,
            'genres' => $this->resolveGenreSlugsCsv($data['genres'] ?? []),
        ]);

        $this->clearCache();
        return $anime;
    }

    public function updateFromTmdbData(Anime $anime, array $data): bool
    {
        $updated = $anime->update([
            'name' => $data['name'] ?? $data['title'],
            'name_alternative' => $data['original_name'] ?? $data['original_title'] ?? null,
            'overview' => $data['overview'] ?? $anime->overview,
            'poster' => $data['poster_path'] ?? $anime->poster,
            'banner' => $data['backdrop_path'] ?? $anime->banner,
            'aired' => $data['first_air_date'] ?? $data['release_date'] ?? $anime->aired,
            'vote_average' => $data['vote_average'] ?? $anime->vote_average,
            'genres' => $this->resolveGenreSlugsCsv($data['genres'] ?? []) ?? $anime->genres,
        ]);

        $this->clearCache();
        return $updated;
    }

    public function updateFromMalData(Anime $anime, array $data): bool
    {
        $altTitles = MalMapper::mapAltTitles($data);

        $updated = $anime->update([
            'name' => $data['title'] ?? $anime->name,
            'name_alternative' => !empty($altTitles) ? implode(', ', $altTitles) : $anime->name_alternative,
            'status' => MalMapper::mapStatus($data['status'] ?? null),
            'vote_average' => $data['mean'] ?? $anime->vote_average,
            'rating' => MalMapper::normalizeRating($data['rating'] ?? $anime->rating),
            'broadcast' => MalMapper::mapBroadcast($data['broadcast']['day_of_the_week'] ?? null),
            'genres' => $this->resolveGenreSlugsCsv($data['genres'] ?? [], 'name_mal') ?? $anime->genres,
            'premiered' => MalMapper::mapPremiered($data) ?? $anime->premiered,
            'popularity' => $data['popularity'] ?? $anime->popularity,
        ]);

        $this->clearCache();
        return $updated;
    }

    /**
     * Build the preview payload sent to the frontend when browsing MAL search results,
     * without persisting anything.
     */
    public function mapMalPreview(array $data): array
    {
        $malGenres = $data['genres'] ?? [];

        $malGenresRaw = collect($malGenres)->map(fn (array $genre) => [
            'name' => $genre['name'],
            'slug' => $this->findGenreSlug($genre['name'], 'name_mal'),
        ])->values()->all();

        return [
            'name' => $data['title'] ?? '',
            'vote_average' => $data['mean'] ?? 0,
            'popularity' => $data['num_scoring_users'] ?? 0,
            'rating' => $data['rating'] ?? '',
            'premiered' => MalMapper::mapPremiered($data) ?? '',
            'altTitles' => MalMapper::mapAltTitles($data),
            'mappedGenres' => array_values(array_unique(array_filter(array_column($malGenresRaw, 'slug')))),
            'malGenresRaw' => $malGenresRaw,
            'status' => MalMapper::mapStatus($data['status'] ?? null),
            'broadcast' => MalMapper::mapBroadcast($data['broadcast']['day_of_the_week'] ?? null),
        ];
    }

    /**
     * Flag which TMDB search results already exist locally (by tmdb_id or slug).
     */
    public function markExistingTmdbResults(array $results): array
    {
        $tmdbIds = collect($results)->pluck('id')->filter()->all();
        $slugs = collect($results)->map(fn (array $item) => Str::slug($item['name'] ?? $item['title'] ?? ''))->filter()->all();

        $existingTmdbIds = Anime::whereIn('tmdb_id', $tmdbIds)->pluck('tmdb_id')->all();
        $existingSlugs = Anime::whereIn('slug', $slugs)->pluck('slug')->all();

        return collect($results)->map(function (array $item) use ($existingTmdbIds, $existingSlugs) {
            $slug = Str::slug($item['name'] ?? $item['title'] ?? '');
            $item['exists'] = in_array($item['id'], $existingTmdbIds) || in_array($slug, $existingSlugs);
            return $item;
        })->all();
    }

    public function generateUniqueSlug(string $baseSlug, ?int $excludeId = null): string
    {
        $exists = fn (string $slug) => Anime::where('slug', $slug)
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->exists();

        if (!$exists($baseSlug)) {
            return $baseSlug;
        }

        $count = 2;
        while ($exists("{$baseSlug}-{$count}")) {
            $count++;
        }

        return "{$baseSlug}-{$count}";
    }

    public function normalizeRatingForDisplay(?string $rating): string
    {
        return MalMapper::normalizeRating($rating);
    }

    public function clearCache(): void
    {
        Cache::tags(['home', 'catalog'])->flush();
    }

    private function resolveGenreSlugsCsv(array $externalGenres, string $matchField = 'title'): ?string
    {
        if (empty($externalGenres)) {
            return null;
        }

        $slugs = collect($externalGenres)
            ->map(fn (array $genre) => $this->findGenreSlug($genre['name'], $matchField))
            ->filter()
            ->unique()
            ->values();

        return $slugs->isEmpty() ? null : $slugs->implode(',');
    }

    private function findGenreSlug(string $name, string $matchField = 'title'): ?string
    {
        $name = strtolower(trim($name));

        $genre = Genre::whereRaw('LOWER(' . $matchField . ') = ?', [$name])
            ->orWhereRaw('LOWER(title) = ?', [$name])
            ->orWhereRaw('LOWER(name_mal) = ?', [$name])
            ->first();

        return $genre?->slug;
    }
}
