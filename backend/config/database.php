<?php

// Parse DATABASE_URL si disponible (format Railway/Heroku)
// Ex: postgresql://user:pass@host:5432/dbname
$dbUrl = env('DATABASE_URL');
$db = [];

if ($dbUrl) {
    $parsed = parse_url($dbUrl);
    $db = [
        'host'     => $parsed['host'] ?? '127.0.0.1',
        'port'     => $parsed['port'] ?? 5432,
        'database' => ltrim($parsed['path'] ?? '/mamutuelle', '/'),
        'username' => $parsed['user'] ?? 'postgres',
        'password' => $parsed['pass'] ?? '',
    ];
} else {
    $db = [
        'host'     => env('DB_HOST', '127.0.0.1'),
        'port'     => env('DB_PORT', 5432),
        'database' => env('DB_DATABASE', 'mamutuelle'),
        'username' => env('DB_USERNAME', 'postgres'),
        'password' => env('DB_PASSWORD', ''),
    ];
}

return [
    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [
        'pgsql' => [
            'driver'   => 'pgsql',
            'host'     => $db['host'],
            'port'     => $db['port'],
            'database' => $db['database'],
            'username' => $db['username'],
            'password' => $db['password'],
            'charset'  => 'utf8',
            'prefix'   => '',
            'sslmode'  => env('DB_SSLMODE', 'require'),
        ],
    ],

    'migrations' => 'migrations',
];
