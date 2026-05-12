<?php

namespace App\Services\Admin;

use Exception;
use App\Models\Genre;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Pagination\LengthAwarePaginator;

class GenreService
{
    public function getAllPaginated(array $filters = []): LengthAwarePaginator
    {
        return Genre::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('name_mal', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
            })
            ->orderBy('title', 'asc')
            ->paginate(10)
            ->withQueryString();
    }

    public function store(array $data): Genre
    {
        $data['slug'] = $data['slug'] ?: Str::slug($data['title']);
        return Genre::create($data);
    }

    public function update(Genre $genre, array $data): bool
    {
        $data['slug'] = $data['slug'] ?: Str::slug($data['title']);
        return $genre->update($data);
    }

    public function delete(Genre $genre): ?bool
    {
        return $genre->delete();
    }

    public function syncFromMal(): int
    {
        $malGenres = [
            'Action' => 'Acción',
            'Martial Arts' => 'Artes Marciales',
            'Adventure' => 'Aventura',
            'Sci-Fi' => 'Ciencia Ficción',
            'Comedy' => 'Comedia',
            'Sports' => 'Deportes',
            'Detective' => 'Detectives',
            'Drama' => 'Drama',
            'Ecchi' => 'Ecchi',
            'School' => 'Escolar',
            'Space' => 'Espacio',
            'Fantasy' => 'Fantasía',
            'Gore' => 'Gore',
            'Harem' => 'Harem',
            'Historical' => 'Histórico',
            'Horror' => 'Horror',
            'Isekai' => 'Isekai',
            'Josei' => 'Josei',
            'Game' => 'Juegos',
            'Mahou Shoujo' => 'Mahou Shoujo',
            'Mecha' => 'Mecha',
            'Military' => 'Militar',
            'Mystery' => 'Misterio',
            'Mythology' => 'Mitológico',
            'Music' => 'Musica',
            'Parody' => 'Parodia',
            'Psychological' => 'Psicológico',
            'Slice of Life' => 'Recuentos De La Vida',
            'Romance' => 'Romance',
            'Samurai' => 'Samurais',
            'Seinen' => 'Seinen',
            'Shoujo' => 'Shoujo',
            'Girls Love' => 'Shoujo Ai',
            'Shounen' => 'Shounen',
            'Boys Love' => 'Shounen Ai',
            'Supernatural' => 'Sobrenatural',
            'Erotica' => 'Soft Hentai',
            'Super Power' => 'Super Poderes',
            'Suspense' => 'Suspenso',
            'Vampire' => 'Vampiros',
        ];

        $count = 0;
        foreach ($malGenres as $malName => $spanishTitle) {
            $genre = Genre::where('title', $spanishTitle)
                ->orWhere('slug', Str::slug($spanishTitle))
                ->first();

            if ($genre) {
                $genre->update(['name_mal' => $malName]);
                $count++;
            }
        }

        return $count;
    }
}
