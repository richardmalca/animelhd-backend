<?php

namespace App\Services\Admin;

use App\Models\Anime;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class AnimeService
{
    public function createFromTmdbData(array $data, string $mediaType, int $tmdbId): Anime
    {
        $name = $data['name'] ?? $data['title'];
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        
        $count = 1;
        while (Anime::where('slug', $slug)->exists()) {
            $count++;
            $slug = "{$baseSlug}-{$count}";
        }

        $genres = [];
        if (isset($data['genres'])) {
            foreach ($data['genres'] as $genre) {
                $dbGenre = \App\Models\Genre::whereRaw('LOWER(title) = ?', [strtolower(trim($genre['name']))])
                    ->orWhereRaw('LOWER(name_mal) = ?', [strtolower(trim($genre['name']))])
                    ->first();
                if ($dbGenre) {
                    $genres[] = $dbGenre->slug;
                }
            }
        }

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
            'genres' => !empty($genres) ? implode(',', $genres) : null,
        ]);

        $this->clearCache();
        return $anime;
    }

    public function clearCache(): void
    {
        Cache::tags(['home', 'catalog'])->flush();
    }

    public function updateFromTmdbData(Anime $anime, array $data): bool
    {
        $genres = [];
        if (isset($data['genres'])) {
            foreach ($data['genres'] as $genre) {
                $dbGenre = \App\Models\Genre::whereRaw('LOWER(title) = ?', [strtolower(trim($genre['name']))])
                    ->orWhereRaw('LOWER(name_mal) = ?', [strtolower(trim($genre['name']))])
                    ->first();
                if ($dbGenre) {
                    $genres[] = $dbGenre->slug;
                }
            }
        }

        $updated = $anime->update([
            'name' => $data['name'] ?? $data['title'],
            'name_alternative' => $data['original_name'] ?? $data['original_title'] ?? null,
            'overview' => $data['overview'] ?? $anime->overview,
            'poster' => $data['poster_path'] ?? $anime->poster,
            'banner' => $data['backdrop_path'] ?? $anime->banner,
            'aired' => $data['first_air_date'] ?? $data['release_date'] ?? $anime->aired,
            'vote_average' => $data['vote_average'] ?? $anime->vote_average,
            'genres' => !empty($genres) ? implode(',', $genres) : $anime->genres,
        ]);

        $this->clearCache();
        return $updated;
    }

    /**
     * Update an existing anime from MyAnimeList data.
     */
    public function updateFromMalData(Anime $anime, array $data): bool
    {
        $statusMap = [
            'currently_airing' => 1,
            'finished_airing' => 0,
            'not_yet_aired' => 3,
        ];

        $broadcastMap = [
            'monday' => 1,
            'tuesday' => 2,
            'wednesday' => 3,
            'thursday' => 4,
            'friday' => 5,
            'saturday' => 6,
            'sunday' => 7,
        ];

        $altTitles = [];
        if (isset($data['alternative_titles'])) {
            if (!empty($data['alternative_titles']['en'])) $altTitles[] = $data['alternative_titles']['en'];
            if (!empty($data['alternative_titles']['ja'])) $altTitles[] = $data['alternative_titles']['ja'];
            if (!empty($data['alternative_titles']['synonyms'])) {
                $altTitles = array_merge($altTitles, $data['alternative_titles']['synonyms']);
            }
        }

        // Mapping genres
        $genres = [];
        if (isset($data['genres'])) {
            foreach ($data['genres'] as $genre) {
                $dbGenre = \App\Models\Genre::whereRaw('LOWER(name_mal) = ?', [strtolower($genre['name'])])->first();
                if ($dbGenre) {
                    $genres[] = $dbGenre->slug;
                }
            }
        }

        $updated = $anime->update([
            'name' => $data['title'] ?? $anime->name,
            'name_alternative' => !empty($altTitles) ? implode(', ', array_unique($altTitles)) : $anime->name_alternative,
            'status' => $statusMap[$data['status'] ?? ''] ?? $anime->status,
            'vote_average' => $data['mean'] ?? $anime->vote_average,
            'rating' => $this->normalizeRating($data['rating'] ?? $anime->rating),
            'broadcast' => $broadcastMap[$data['broadcast']['day_of_the_week'] ?? ''] ?? $anime->broadcast,
            'genres' => !empty($genres) ? implode(',', $genres) : $anime->genres,
            'premiered' => $data['start_season'] ? ucfirst($data['start_season']['season']) . ' ' . $data['start_season']['year'] : $anime->premiered,
            'popularity' => $data['popularity'] ?? $anime->popularity,
        ]);

        $this->clearCache();
        return $updated;
    }

    private function normalizeRating(?string $rating): string
    {
        if (!$rating) return 'Selecciona una clasificación';

        $cleanRating = strtolower(trim($rating));

        if (str_contains($cleanRating, 'pg-13') || str_contains($cleanRating, 'pg_13') || str_contains($cleanRating, 'teens') || str_contains($cleanRating, 'mayores de 13')) {
            return 'Apto para mayores de 13 años';
        }

        if ($cleanRating === 'g' || str_contains($cleanRating, 'all ages') || str_contains($cleanRating, 'todos los públicos')) {
            return 'Apto para todos los públicos';
        }

        if ($cleanRating === 'pg' || str_contains($cleanRating, 'children') || str_contains($cleanRating, 'niños')) {
            return 'Apto para niños';
        }

        if ($cleanRating === 'r' || str_contains($cleanRating, '17+') || (str_contains($cleanRating, 'mayores de 17') && !str_contains($cleanRating, 'restringido'))) {
            return 'Apto para mayores de 17 años';
        }

        if ($cleanRating === 'r+' || str_contains($cleanRating, 'restringido') || str_contains($cleanRating, 'mild nudity')) {
            return 'Apto para mayores de 17 años (Restringido)';
        }

        if ($cleanRating === 'rx' || str_contains($cleanRating, 'hentai') || str_contains($cleanRating, 'adults') || str_contains($cleanRating, 'adultos')) {
            return 'Contenido para adultos';
        }

        return 'Selecciona una clasificación';
    }
}
