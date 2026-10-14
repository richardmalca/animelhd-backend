<?php

namespace App\Observers;

use App\Services\Sync\SyncChangeRecorder;

class GenreSyncObserver extends SyncObserver
{
    protected function entity(): string
    {
        return SyncChangeRecorder::GENRE;
    }
}
