<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\EmailReportService;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(private EmailReportService $reportService)
    {
    }

    public function emails(): Response
    {
        return Inertia::render('admin/reports/emails', [
            'report' => $this->reportService->latest(),
        ]);
    }

    public function refreshEmails()
    {
        set_time_limit(300);

        try {
            $this->reportService->generate();
        } catch (\Throwable $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "No se pudo generar el reporte: {$e->getMessage()}",
            ]);

            return back();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Reporte actualizado.',
        ]);

        return back();
    }
}
