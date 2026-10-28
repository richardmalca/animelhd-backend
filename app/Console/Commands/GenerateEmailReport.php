<?php

namespace App\Console\Commands;

use App\Services\Admin\EmailReportService;
use Illuminate\Console\Command;

class GenerateEmailReport extends Command
{
    protected $signature = 'users:email-report {--mx : Comprueba si los dominios menos comunes tienen servidor de correo}';

    protected $description = 'Calcula el reporte de calidad de los correos de los usuarios y lo guarda para el panel';

    public function handle(EmailReportService $service): int
    {
        $report = $service->generate((bool) $this->option('mx'));
        $totals = $report['totals'];

        $this->table(
            ['Indicador', 'Usuarios'],
            collect($totals)->map(fn ($value, string $key) => [$key, $value ?? '-'])->values()->all(),
        );

        $this->info("Reporte listo en {$report['duration_seconds']} s.");

        return self::SUCCESS;
    }
}
