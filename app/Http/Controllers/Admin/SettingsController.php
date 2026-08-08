<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function __construct(protected SettingsService $settingsService)
    {
    }

    public function index()
    {
        return Inertia::render('admin/settings/index', [
            'settings' => $this->settingsService->all(),
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

        $settings = $this->settingsService->all();

        $settings['tmdb_api_key'] = $request->input('tmdb_api_key');
        $settings['mal_client_id'] = $request->input('mal_client_id');
        $settings['telegram_bot_token'] = $request->input('telegram_bot_token');
        $settings['telegram_chat_id'] = $request->input('telegram_chat_id');
        $settings['voe_email'] = $request->input('voe_email');
        $settings['voe_password'] = $request->input('voe_password');
        $settings['frontend_url'] = $request->input('frontend_url');
        $settings['server_keys'] = $request->input('server_keys', []);

        $this->settingsService->save($settings);

        return back()->with('success', 'Configuración actualizada correctamente');
    }

}
