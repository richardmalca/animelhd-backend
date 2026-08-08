<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\File;

class SettingsService
{
    /**
     * Claves consideradas sensibles: se cifran en disco con la APP_KEY
     * y se descifran de forma transparente al leerlas.
     */
    protected const SENSITIVE_KEYS = [
        'tmdb_api_key',
        'mal_client_id',
        'telegram_bot_token',
        'voe_email',
        'voe_password',
        'server_keys',
    ];

    protected string $settingsFile;

    public function __construct()
    {
        $this->settingsFile = storage_path('app/settings.json');
    }

    /**
     * Devuelve todos los settings ya descifrados, listos para mostrar en el panel admin.
     */
    public function all(): array
    {
        return $this->readDecrypted();
    }

    /**
     * Obtiene un valor puntual (ya descifrado si era sensible).
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return $this->readDecrypted()[$key] ?? $default;
    }

    /**
     * Persiste el array completo de settings, cifrando las claves sensibles.
     */
    public function save(array $settings): void
    {
        $toStore = $settings;

        foreach (self::SENSITIVE_KEYS as $key) {
            if (array_key_exists($key, $toStore) && $toStore[$key] !== null && $toStore[$key] !== '') {
                $toStore[$key] = Crypt::encryptString(
                    is_array($toStore[$key]) ? json_encode($toStore[$key]) : (string) $toStore[$key]
                );
            }
        }

        File::put($this->settingsFile, json_encode($toStore, JSON_PRETTY_PRINT));
    }

    protected function readDecrypted(): array
    {
        if (!File::exists($this->settingsFile)) {
            return [];
        }

        $settings = json_decode(File::get($this->settingsFile), true) ?? [];

        foreach (self::SENSITIVE_KEYS as $key) {
            if (!array_key_exists($key, $settings) || $settings[$key] === null || $settings[$key] === '') {
                continue;
            }

            $settings[$key] = $this->decryptOrKeepLegacy($settings[$key], $key);
        }

        return $settings;
    }

    /**
     * Intenta descifrar el valor. Si falla (valor guardado antes de este cambio,
     * todavía en texto plano), lo devuelve tal cual para no romper configuraciones
     * existentes hasta que se re-guarden desde el panel.
     */
    protected function decryptOrKeepLegacy(mixed $value, string $key): mixed
    {
        if (!is_string($value)) {
            return $value;
        }

        try {
            $decrypted = Crypt::decryptString($value);

            if ($key === 'server_keys') {
                return json_decode($decrypted, true) ?? [];
            }

            return $decrypted;
        } catch (\Throwable $e) {
            // Valor legacy en texto plano (pre-cifrado): se devuelve sin tocar.
            return $value;
        }
    }
}
