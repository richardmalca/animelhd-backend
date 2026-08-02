<?php

namespace App\Console\Commands;

use App\Services\Api\ViewCounterService;
use Illuminate\Console\Command;

class FlushViewCounters extends Command
{
    protected $signature = 'views:flush';

    protected $description = 'Sincroniza los contadores de vistas acumulados en Redis con la base de datos';

    public function handle(ViewCounterService $viewCounterService): int
    {
        $viewCounterService->flush();

        $this->info('Vistas sincronizadas con la base de datos.');

        return 0;
    }
}
