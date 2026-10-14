<?php

namespace App\Observers;

use App\Services\Sync\SyncChangeRecorder;

class ServerSyncObserver extends SyncObserver
{
    protected function entity(): string
    {
        return SyncChangeRecorder::SERVER;
    }
}
