<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index()
    {
        return Inertia::render('admin', [
            'stats' => $this->dashboardService->getStats(),
        ]);
    }

    public function flushCache()
    {
        Cache::flush();

        return back()->with('success', '¡Caché de Redis vaciado correctamente!');
    }
}
