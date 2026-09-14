<?php

use App\Models\Episode;
use App\Models\Player;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Schema;

beforeEach(function (): void {
    Schema::create('episodes', function (Blueprint $table): void {
        $table->id();
        $table->unsignedBigInteger('anime_id');
        $table->decimal('number', 8, 2);
        $table->timestamps();
    });

    Schema::create('players', function (Blueprint $table): void {
        $table->id();
        $table->unsignedBigInteger('episode_id');
        $table->unsignedBigInteger('server_id');
        $table->unsignedTinyInteger('languaje');
        $table->string('code');
        $table->timestamps();
    });
});

it('publishes shared Redis markers when catalog records are saved', function (): void {
    $connection = Mockery::mock();

    Redis::shouldReceive('connection')
        ->times(2)
        ->with('shared')
        ->andReturn($connection);

    $connection->shouldReceive('set')
        ->once()
        ->with('episodes:last_id', 1);
    $connection->shouldReceive('set')
        ->once()
        ->with('players:last_updated', Mockery::type('string'));

    $episode = Episode::create(['anime_id' => 1, 'number' => 1]);
    Player::create([
        'episode_id' => $episode->id,
        'server_id' => 1,
        'languaje' => 0,
        'code' => 'test',
    ]);
});
