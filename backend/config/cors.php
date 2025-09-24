<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration
    |--------------------------------------------------------------------------
    |
    | This file configures Cross-Origin Resource Sharing for your application.
    | To support Laravel Sanctum with SPA (React/Vite) using cookies,
    | ensure credentials are enabled and origins are explicitly defined.
    |
    */

    'paths' => [
        'api/*',
        'login',
        'logout',
        'register',
        'user',
        'announcements',
        'admin/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => ['*'], // Allow all HTTP methods

    'allowed_origins' => ['*'], // Allow all origins during development

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // Allow all headers

    'exposed_headers' => ['Authorization'],

    'max_age' => 0,

    'supports_credentials' => true,

];
