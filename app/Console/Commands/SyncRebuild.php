<?php

namespace App\Console\Commands;

use App\Services\Sync\SyncChangeRecorder;
use Illuminate\Console\Command;

class SyncRebuild extends Command
{
    protected $signature = 'sync:rebuild';

    protected $description = 'Reconstruye el registro de cambios de /api/sync con todo lo que existe hoy (las apps descargan todo de nuevo)';

    public function handle(SyncChangeRecorder $recorder): int
    {
        $count = $recorder->rebuild();

        $this->info("Registro reconstruido: {$count} entidades.");

        return self::SUCCESS;
    }
}
