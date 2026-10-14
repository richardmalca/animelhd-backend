<?php

use App\Services\Sync\SyncChangeRecorder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Registro de cambios para GET /api/sync.
 *
 * Guarda UNA fila por entidad (anime, género, servidor, episodio o reproductor): cada vez que algo
 * cambia, su fila se reemplaza por otra con un id más alto. Ese id es el cursor que usan las apps,
 * y la tabla nunca crece más que la cantidad de entidades.
 *
 * Al crearse se siembra con todo lo que ya existe, para que una app nueva descargue el catálogo
 * completo recorriendo el mismo registro.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sync_changes', function (Blueprint $table) {
            $table->id();
            $table->string('entity', 16);
            $table->unsignedBigInteger('entity_id');
            $table->boolean('deleted')->default(false);
            $table->timestamp('created_at')->nullable();

            $table->unique(['entity', 'entity_id']);
        });

        app(SyncChangeRecorder::class)->rebuild();
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_changes');
    }
};
