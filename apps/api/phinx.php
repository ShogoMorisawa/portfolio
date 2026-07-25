<?php

declare(strict_types=1);

$databaseUrl = getenv('DATABASE_URL') ?: null;

return [
    'paths' => [
        'migrations' => __DIR__ . '/migrations',
    ],
    'environments' => [
        'default_migration_table' => 'phinxlog',
        'default_environment' => getenv('APP_ENV') === 'production' ? 'production' : 'development',
        'development' => $databaseUrl !== null
            ? ['adapter' => 'pgsql', 'dsn' => $databaseUrl]
            : [
                'adapter' => 'pgsql',
                'host' => getenv('DB_HOST') ?: 'db',
                'name' => getenv('DB_NAME') ?: 'blog_db',
                'user' => getenv('DB_USER') ?: 'blog_user',
                'pass' => getenv('DB_PASS') ?: 'blog_pass',
                'port' => 5432,
                'charset' => 'utf8',
            ],
        'production' => [
            'adapter' => 'pgsql',
            'dsn' => $databaseUrl,
        ],
    ],
    'version_order' => 'creation',
];
