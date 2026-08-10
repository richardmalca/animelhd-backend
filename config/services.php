<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'app_key_header' => [
        'key' => env('X_APP_KEY'),
    ],

    'player_bridge' => [
        // Dominios desde los que se permite cargar /v/{slug}/{token} (vía Referer
        // del <iframe> embebido en el frontend). Cualquier otro origen, o un
        // acceso directo sin Referer (link pegado, scraping, curl), se rechaza.
        'allowed_hosts' => array_filter(array_map(
            'trim',
            explode(',', env('PLAYER_BRIDGE_ALLOWED_HOSTS', 'www.animelatinohd.com,animelatinohd.com'))
        )),
    ],

    // Whitelists de Referer reutilizables por el middleware CheckAllowedReferer
    // (->middleware('referer.whitelist:<clave>')). Cada clave es un grupo de
    // rutas distinto.
    'referer_whitelists' => [
        'auth_api' => array_filter(array_map(
            'trim',
            explode(',', env('AUTH_API_ALLOWED_HOSTS', 'restore.kawaiianimes.app'))
        )),
    ],

];
