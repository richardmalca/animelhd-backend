<?php

namespace App\Services\Sync;

use Illuminate\Support\Facades\DB;

/**
 * Anota en `sync_changes` qué entidades cambiaron o se borraron.
 *
 * Mantiene una sola fila por entidad: al registrar un cambio se borra la fila anterior y se inserta
 * una nueva, que recibe un id más alto. Así el id sirve de cursor y la tabla no crece sin límite.
 */
class SyncChangeRecorder
{
    public const ANIME = 'anime';

    public const GENRE = 'genre';

    public const SERVER = 'server';

    public const EPISODE = 'episode';

    public const PLAYER = 'player';

    /**
     * Fila especial que deja `rebuild()`: marca desde qué id empieza la nueva generación del registro.
     * Un cursor anterior a esa marca pertenece a un registro que ya no existe.
     */
    public const RESET = 'reset';

    /** Entidad => tabla. El orden es el de la siembra inicial: primero lo que otros referencian. */
    public const TABLES = [
        self::ANIME => 'animes',
        self::GENRE => 'genres',
        self::SERVER => 'servers',
        self::EPISODE => 'episodes',
        self::PLAYER => 'players',
    ];

    private const CHUNK = 500;

    public function record(string $entity, int $id, bool $deleted = false): void
    {
        $this->recordMany($entity, [$id], $deleted);
    }

    /**
     * @param  iterable<int>  $ids
     */
    public function recordMany(string $entity, iterable $ids, bool $deleted = false): void
    {
        // Anotar un cambio nunca debe impedir guardarlo. Si falla (por ejemplo, entre que se despliega
        // el código y se ejecuta la migración), se reporta y la escritura sigue. Lo que se pierda se
        // recupera con `php artisan sync:rebuild`.
        try {
            foreach (array_chunk(collect($ids)->unique()->values()->all(), self::CHUNK) as $chunk) {
                DB::transaction(function () use ($entity, $chunk, $deleted) {
                    DB::table('sync_changes')
                        ->where('entity', $entity)
                        ->whereIn('entity_id', $chunk)
                        ->delete();

                    $now = now()->toDateTimeString();
                    DB::table('sync_changes')->insert(array_map(
                        fn (int $id) => [
                            'entity' => $entity,
                            'entity_id' => $id,
                            'deleted' => $deleted,
                            'created_at' => $now,
                        ],
                        $chunk,
                    ));
                });
            }
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Vacía el registro y lo vuelve a sembrar con todo lo que existe hoy.
     * Las apps que ya tenían un cursor lo detectan (`reset`) y descargan todo de nuevo.
     */
    public function rebuild(): int
    {
        return DB::transaction(function () {
            DB::table('sync_changes')->delete();

            $now = now()->toDateTimeString();
            DB::table('sync_changes')->insert([
                'entity' => self::RESET,
                'entity_id' => 0,
                'deleted' => false,
                'created_at' => $now,
            ]);

            foreach (self::TABLES as $entity => $table) {
                DB::table('sync_changes')->insertUsing(
                    ['entity', 'entity_id', 'deleted', 'created_at'],
                    DB::table($table)
                        ->selectRaw('? as entity, id as entity_id, 0 as deleted, ? as created_at', [$entity, $now])
                        ->orderBy('id'),
                );
            }

            return DB::table('sync_changes')->where('entity', '!=', self::RESET)->count();
        });
    }
}
