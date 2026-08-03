<?php

namespace App\Services\Admin;

use App\Models\Genre;
use Illuminate\Support\Str;
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

}
