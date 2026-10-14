<?php

namespace App\Observers;

use App\Services\Sync\SyncChangeRecorder;

class EpisodeSyncObserver extends SyncObserver
{
    protected function entity(): string
    {
        return SyncChangeRecorder::EPISODE;
    }
}
