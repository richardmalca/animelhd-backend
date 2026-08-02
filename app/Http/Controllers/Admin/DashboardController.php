<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardService;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index()
    {
        return Inertia::render('admin/index', [
            'stats' => $this->dashboardService->getStats(),
        ]);
    }

    public function flushCache()
    {
        try {
            Cache::flush();
        } catch (\Throwable $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "No se pudo vaciar el caché: {$e->getMessage()}",
            ]);

            return back();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Caché vaciado correctamente.',
        ]);

        return back();
    }
}
