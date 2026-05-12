<?php

namespace App\Services\Admin;

use App\Models\Player;
use App\Models\Episode;
use App\Models\Server;
use Illuminate\Validation\ValidationException;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class PlayerService
{
    public function getPlayersByEpisode(int $episodeId)
    {
        return Player::with('server')
            ->where('episode_id', $episodeId)
            ->get();
    }

    public function getServers()
    {
        return Server::where('status', 1)->orderBy('position')->get();
    }

    public function store(array $data)
    {
        $this->validateDomain($data['code'], $data['server_id']);
        
        // Validar que no exista un player con el mismo servidor e idioma para este episodio
        $existingPlayer = Player::where('episode_id', $data['episode_id'])
            ->where('server_id', $data['server_id'])
            ->where('languaje', $data['languaje'])
            ->first();

        if ($existingPlayer) {
            throw ValidationException::withMessages([
                'server_id' => 'Este servidor e idioma ya están registrados.',
                'existing_player_id' => $existingPlayer->id
            ]);
        }

        $data['code'] = $this->extractPlayerId($data['code']);
        if (!empty($data['code_backup'])) {
            $data['code_backup'] = $this->extractPlayerId($data['code_backup']);
        }

        $player = Player::create($data);
        $this->clearCache($player);
        return $player;
    }

    public function update(Player $player, array $data)
    {
        $this->validateDomain($data['code'], $player->server_id);
        
        // Validar unicidad excluyendo al actual
        $exists = Player::where('episode_id', $player->episode_id)
            ->where('server_id', $data['server_id'])
            ->where('languaje', $data['languaje'])
            ->where('id', '!=', $player->id)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'server_id' => 'Ya existe otro reproductor configurado con este servidor e idioma.'
            ]);
        }

        $data['code'] = $this->extractPlayerId($data['code']);
        if (!empty($data['code_backup'])) {
            $data['code_backup'] = $this->extractPlayerId($data['code_backup']);
        }

        $player->update($data);
        $this->clearCache($player);
        return $player;
    }

    public function delete(Player $player)
    {
        $this->clearCache($player);
        return $player->delete();
    }

    private function validateDomain(string $url, int $serverId)
    {
        if (!str_starts_with($url, 'http')) {
            return;
        }

        $server = Server::find($serverId);
        if (!$server || empty($server->domains)) {
            return;
        }

        $host = strtolower(parse_url($url, PHP_URL_HOST));
        if (!$host) return;

        $isValid = false;
        foreach ($server->domains as $domain) {
            $domain = strtolower($domain);
            if (str_contains($host, $domain)) {
                $isValid = true;
                break;
            }
        }

        if (!$isValid) {
            throw ValidationException::withMessages([
                'code' => "La URL no pertenece a los dominios autorizados para el servidor {$server->title}."
            ]);
        }
    }

    private function extractPlayerId(string $url): string
    {
        if (!str_starts_with($url, 'http')) {
            return $url;
        }

        $path = parse_url($url, PHP_URL_PATH);
        if (!$path) return $url;

        $parts = explode('/', trim($path, '/'));
        
        // Si el último fragmento es una acción común (download, embed, etc.), lo ignoramos
        $commonSuffixes = ['download', 'embed', 'e', 'd', 'f', 'v'];
        if (count($parts) > 1 && in_array(strtolower(end($parts)), $commonSuffixes)) {
            array_pop($parts);
        }

        // Casos conocidos con prefijo (ej: /e/ID, /v/ID)
        if (count($parts) >= 2 && in_array($parts[0], ['e', 'd', 'v', 'f', 'embed'])) {
            return $parts[1];
        }

        $lastPart = end($parts);
        
        // Si contiene un punto (ej: video.mp4), intentamos tomar la parte anterior si existe
        if (str_contains($lastPart, '.')) {
            return count($parts) > 1 ? $parts[count($parts) - 2] : $lastPart;
        }

        return $lastPart;
    }

    private function clearCache(Player $player)
    {
        $episode = Episode::with('anime')->find($player->episode_id);
        if ($episode && $episode->anime) {
            $slug = $episode->anime->slug;

            // Limpiamos tags de producción de forma masiva
            Cache::tags([
                'home', 
                'calendar', 
                'anime-detail', 
                'episode-detail', 
                "anime-{$slug}"
            ])->flush();
        }
    }
}
