<?php

namespace App\Console\Commands;

use App\Services\Sync\SyncReconciler;
use Illuminate\Console\Command;

class SyncReconcile extends Command
{
    protected $signature = 'sync:reconcile {--full : Revisa también huecos y borrados (cruza las tablas completas)}';

    protected $description = 'Anota en el registro de /api/sync lo que otras apps escribieron en la base de datos sin pasar por esta';

    public function handle(SyncReconciler $reconciler): int
    {
        $summary = $reconciler->reconcile((bool) $this->option('full'));

        $this->table(
            ['Entidad', 'Nuevos', 'Modificados', 'Huecos', 'Borrados'],
            collect($summary)->map(fn (array $row, string $entity) => [$entity, $row['new'], $row['updated'], $row['gaps'], $row['deleted']])->values()->all(),
        );

        return self::SUCCESS;
    }
}
