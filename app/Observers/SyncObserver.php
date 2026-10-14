<?php

namespace App\Observers;

use App\Models\Episode;
use App\Models\Player;
use App\Services\Sync\SyncChangeRecorder;
use Illuminate\Database\Eloquent\Model;

/**
 * Registra en `sync_changes` los cambios de un modelo para que las apps los reciban en GET /api/sync.
 *
 * Todas las escrituras del proyecto pasan por Eloquent, así que estos eventos las capturan todas.
 * Lo único que no pasa por aquí es el contador de vistas (`DB::table()->increment('views')`),
 * que a propósito no debe generar cambios.
 *
 * Laravel crea los observadores por su nombre de clase, por eso hay una subclase por modelo en lugar
 * de pasar la entidad por el constructor.
 */
abstract class SyncObserver
{
    public function __construct(protected readonly SyncChangeRecorder $recorder) {}

    /** Una de las constantes de `SyncChangeRecorder`. */
    abstract protected function entity(): string;

    public function saved(Model $model): void
    {
        // `save()` dispara este evento aunque no cambie nada (por ejemplo un updateOrCreate idéntico).
        if (! $model->wasRecentlyCreated && ! $model->wasChanged()) {
            return;
        }

        $this->recorder->record($this->entity(), (int) $model->getKey());
    }

    /**
     * Antes de borrar se anotan también los hijos: la base puede borrarlos en cascada sin disparar
     * eventos, y las apps necesitan saber que ya no existen.
     */
    public function deleting(Model $model): void
    {
        $id = (int) $model->getKey();

        match ($this->entity()) {
            SyncChangeRecorder::ANIME => $this->recordAnimeChildren($id),
            SyncChangeRecorder::EPISODE => $this->recordEpisodeChildren([$id]),
            SyncChangeRecorder::SERVER => $this->recorder->recordMany(
                SyncChangeRecorder::PLAYER,
                Player::where('server_id', $id)->pluck('id'),
                deleted: true,
            ),
            default => null,
        };
    }

    public function deleted(Model $model): void
    {
        $this->recorder->record($this->entity(), (int) $model->getKey(), deleted: true);
    }

    private function recordAnimeChildren(int $animeId): void
    {
        $episodeIds = Episode::where('anime_id', $animeId)->pluck('id')->all();

        $this->recordEpisodeChildren($episodeIds);
        $this->recorder->recordMany(SyncChangeRecorder::EPISODE, $episodeIds, deleted: true);
    }

    /**
     * @param  array<int>  $episodeIds
     */
    private function recordEpisodeChildren(array $episodeIds): void
    {
        foreach (array_chunk($episodeIds, 1000) as $chunk) {
            $this->recorder->recordMany(
                SyncChangeRecorder::PLAYER,
                Player::whereIn('episode_id', $chunk)->pluck('id'),
                deleted: true,
            );
        }
    }
}
