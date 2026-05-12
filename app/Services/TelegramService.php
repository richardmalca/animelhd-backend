<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

class TelegramService
{
    protected $token;
    protected $chatId;

    public function __construct(?string $token = null, ?string $chatId = null)
    {
        if ($token && $chatId) {
            $this->token = $token;
            $this->chatId = $chatId;
            return;
        }

        $settingsFile = storage_path('app/settings.json');
        if (File::exists($settingsFile)) {
            $settings = json_decode(File::get($settingsFile), true);
            $this->token = $settings['telegram_bot_token'] ?? null;
            $this->chatId = $settings['telegram_chat_id'] ?? null;
        }
    }

    public function sendMessage(string $message): ?int
    {
        if (!$this->token || !$this->chatId) {
            return null;
        }

        try {
            $response = Http::post("https://api.telegram.org/bot{$this->token}/sendMessage", [
                'chat_id' => $this->chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
            ]);

            if (!$response->successful()) {
                \Illuminate\Support\Facades\Log::error('Telegram API Error: ' . $response->body());
                return null;
            }

            return $response->json('result.message_id');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Telegram Exception: ' . $e->getMessage());
            return null;
        }
    }

    public function editMessage(int $messageId, string $message): bool
    {
        if (!$this->token || !$this->chatId) {
            return false;
        }

        try {
            $response = Http::post("https://api.telegram.org/bot{$this->token}/editMessageText", [
                'chat_id' => $this->chatId,
                'message_id' => $messageId,
                'text' => $message,
                'parse_mode' => 'HTML',
            ]);

            if (!$response->successful()) {
                \Illuminate\Support\Facades\Log::error('Telegram API Edit Error: ' . $response->body());
            }

            return $response->successful();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Telegram Edit Exception: ' . $e->getMessage());
            return false;
        }
    }
}
