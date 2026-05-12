<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class SettingsController extends Controller
{
    protected $settingsFile;

    public function __construct()
    {
        $this->settingsFile = storage_path('app/settings.json');
    }

    public function index()
    {
        $settings = [];
        if (File::exists($this->settingsFile)) {
            $settings = json_decode(File::get($this->settingsFile), true);
        }

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'tmdb_api_key' => 'nullable|string',
            'telegram_chat_id' => 'nullable|string',
            'server_keys' => 'nullable|array',
            'voe_email' => 'nullable|email',
            'voe_password' => 'nullable|string',
        ]);

        $settings = [];
        if (File::exists($this->settingsFile)) {
            $settings = json_decode(File::get($this->settingsFile), true);
        }

        $settings['tmdb_api_key'] = $request->input('tmdb_api_key');
        $settings['mal_client_id'] = $request->input('mal_client_id');
        $settings['telegram_bot_token'] = $request->input('telegram_bot_token');
        $settings['telegram_chat_id'] = $request->input('telegram_chat_id');
        $settings['voe_email'] = $request->input('voe_email');
        $settings['voe_password'] = $request->input('voe_password');
        $settings['frontend_url'] = $request->input('frontend_url');
        $settings['server_keys'] = $request->input('server_keys', []);

        File::put($this->settingsFile, json_encode($settings, JSON_PRETTY_PRINT));

        return back()->with('success', 'Configuración actualizada correctamente');
    }

}
