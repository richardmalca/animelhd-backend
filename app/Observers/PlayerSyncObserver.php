<?php

namespace App\Observers;

use App\Services\Sync\SyncChangeRecorder;

class PlayerSyncObserver extends SyncObserver
{
    protected function entity(): string
    {
        return SyncChangeRecorder::PLAYER;
    }
}
