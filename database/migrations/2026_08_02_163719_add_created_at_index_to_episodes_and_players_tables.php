<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('episodes', function (Blueprint $table) {
            $table->index('created_at', 'idx_episodes_created_at');
        });

        Schema::table('players', function (Blueprint $table) {
            $table->index('created_at', 'idx_players_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('episodes', function (Blueprint $table) {
            $table->dropIndex('idx_episodes_created_at');
        });

        Schema::table('players', function (Blueprint $table) {
            $table->dropIndex('idx_players_created_at');
        });
    }
};
