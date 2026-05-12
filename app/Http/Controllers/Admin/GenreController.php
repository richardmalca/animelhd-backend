<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use App\Services\Admin\GenreService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GenreController extends Controller
{
    protected $genreService;

    public function __construct(GenreService $genreService)
    {
        $this->genreService = $genreService;
    }

    public function index(Request $request)
    {
        return Inertia::render('admin/genres/index', [
            'genres' => $this->genreService->getAllPaginated($request->only('search')),
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:genres,slug',
            'name_mal' => 'nullable|string|max:255',
        ]);

        $this->genreService->store($validated);

        return back()->with('success', 'Género creado correctamente');
    }

    public function update(Request $request, Genre $genre)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:genres,slug,' . $genre->id,
            'name_mal' => 'nullable|string|max:255',
        ]);

        $this->genreService->update($genre, $validated);

        return back()->with('success', 'Género actualizado correctamente');
    }

    public function destroy(Genre $genre)
    {
        $this->genreService->delete($genre);
        return back()->with('success', 'Género eliminado correctamente');
    }

    public function malSync()
    {
        $this->genreService->syncFromMal();
        return back();
    }
}
