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
            'Adventure' => 'Aventura',
            'Comedy' => 'Comedia',
            'Drama' => 'Drama',
            'Slice of Life' => 'Recuentos de la vida',
            'Fantasy' => 'Fantasía',
            'Magic' => 'Magia',
            'Supernatural' => 'Sobrenatural',
            'Horror' => 'Terror',
            'Mystery' => 'Misterio',
            'Psychological' => 'Psicológico',
            'Romance' => 'Romance',
            'Sci-Fi' => 'Ciencia Ficción',
            'Cyberpunk' => 'Cyberpunk',
            'Game' => 'Juegos',
            'Demons' => 'Demonios',
            'Ecchi' => 'Ecchi',
            'Military' => 'Militar',
            'Music' => 'Música',
            'Parody' => 'Parodia',
            'Samurai' => 'Samurái',
            'School' => 'Escolar',
            'Shounen' => 'Shounen',
            'Shoujo' => 'Shoujo',
            'Space' => 'Espacio',
            'Sports' => 'Deportes',
            'Super Power' => 'Superpoderes',
            'Vampire' => 'Vampiros',
            'Harem' => 'Harem',
            'Police' => 'Policial',
            'Thriller' => 'Thriller',
            'Seinen' => 'Seinen',
            'Josei' => 'Josei',
            'Martial Arts' => 'Artes Marciales',
            'Mecha' => 'Mecha',
            'Gourmet' => 'Gourmet',
            'Suspense' => 'Suspense',
            'Avant Garde' => 'Vanguardia',
            'Award Winning' => 'Premiados',
            'Boys Love' => 'Boys Love',
            'Girls Love' => 'Girls Love',
            'Work Life' => 'Vida Laboral',
            'Erotica' => 'Erótica',
            'Hentai' => 'Hentai',
            'Historical' => 'Histórico',
            'Mythology' => 'Mitología',
            'Isekai' => 'Isekai',
            'Racing' => 'Carreras',
            'Strategy Game' => 'Juego de Estrategia',
            'Organized Crime' => 'Crimen Organizado',
            'Visual Arts' => 'Artes Visuales',
            'Performing Arts' => 'Artes Escénicas',
            'Video Game' => 'Videojuegos',
            'Time Travel' => 'Viaje en el Tiempo',
            'Childcare' => 'Cuidado de Niños',
            'Combat Sports' => 'Deportes de Combate',
            'Educational' => 'Educativo',
            'High Stakes Game' => 'Juegos de Alto Riesgo',
            'Idols (Female)' => 'Idols (Femenino)',
            'Idols (Male)' => 'Idols (Masculino)',
            'Magical Sex Shift' => 'Cambio de Sexo Mágico',
            'Medical' => 'Médico',
            'Otaku Culture' => 'Cultura Otaku',
            'Pets' => 'Mascotas',
            'Reincarnation' => 'Reencarnación',
            'Reverse Harem' => 'Harem Inverso',
            'Romantic Subtext' => 'Subtexto Romántico',
            'Showbiz' => 'Espectáculo',
            'Survival' => 'Supervivencia',
            'Team Sports' => 'Deportes de Equipo',
            'Anthropomorphic' => 'Antropomórfico',
            'CGDCT' => 'CGDCT',
            'Detective' => 'Detective',
            'Iyashikei' => 'Iyashikei',
            'Love Polygon' => 'Polígono Amoroso',
            'Mahou Shoujo' => 'Mahou Shoujo',
        ];

        try {
            $response = Http::get('https://api.jikan.moe/v4/genres/anime');
            if ($response->successful()) {
                $jikanData = $response->json('data');
                $count = 0;
                foreach ($jikanData as $genre) {
                    $malName = $genre['name'];
                    $spanishTitle = $malGenres[$malName] ?? $malName;

                    Genre::updateOrCreate(
                        ['name_mal' => $malName],
                        [
                            'title' => $spanishTitle,
                            'slug' => Str::slug($spanishTitle)
                        ]
                    );
                    $count++;
                }
                return $count;
            }
        } catch (Exception $e) {
        }

        $count = 0;
        foreach ($malGenres as $malName => $spanishTitle) {
            Genre::updateOrCreate(
                ['name_mal' => $malName],
                [
                    'title' => $spanishTitle,
                    'slug' => Str::slug($spanishTitle)
                ]
            );
            $count++;
        }

        return $count;
    }
}
