<?php

namespace App\Observers;

use App\Services\Sync\SyncChangeRecorder;

class AnimeSyncObserver extends SyncObserver
{
    protected function entity(): string
    {
        return SyncChangeRecorder::ANIME;
    }
}
