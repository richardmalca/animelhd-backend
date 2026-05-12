<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Server;
use App\Services\Admin\ServerService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServerController extends Controller
{
    protected $serverService;

    public function __construct(ServerService $serverService)
    {
        $this->serverService = $serverService;
    }

    public function index(Request $request)
    {
        return Inertia::render('admin/servers/index', [
            'servers' => $this->serverService->getAllPaginated($request->only('search')),
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'embed' => 'required|string|max:255',
            'status' => 'nullable|integer',
            'show_on_web_desktop' => 'nullable|boolean',
            'show_on_web_mobile' => 'nullable|boolean',
            'show_on_app' => 'nullable|boolean',
            'domains' => 'nullable|array',
            'domains.*' => 'string'
        ]);

        $this->serverService->store($validated);

        return back()->with('success', 'Servidor creado correctamente');
    }

    public function update(Request $request, Server $server)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'embed' => 'required|string|max:255',
            'status' => 'nullable|integer',
            'show_on_web_desktop' => 'nullable|boolean',
            'show_on_web_mobile' => 'nullable|boolean',
            'show_on_app' => 'nullable|boolean',
            'domains' => 'nullable|array',
            'domains.*' => 'string'
        ]);

        $this->serverService->update($server, $validated);

        return back()->with('success', 'Servidor actualizado correctamente');
    }

    public function destroy(Server $server)
    {
        $this->serverService->delete($server);
        return back()->with('success', 'Servidor eliminado correctamente');
    }
}
