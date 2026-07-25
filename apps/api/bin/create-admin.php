#!/usr/bin/env php
<?php

declare(strict_types=1);

use App\Auth\Application\AdminProvisioner;
use App\Auth\Infrastructure\PdoUserRepository;
use App\Shared\Infrastructure\DatabaseUrl;

require dirname(__DIR__) . '/vendor/autoload.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This command can only run from the command line.\n");
    exit(1);
}

$databaseUrl = getenv('DATABASE_URL');
if ($databaseUrl === false || trim($databaseUrl) === '') {
    fwrite(STDERR, "DATABASE_URL must be set.\n");
    exit(1);
}

$readRequired = static function (string $prompt): string {
    fwrite(STDOUT, $prompt);
    $value = fgets(STDIN);
    if ($value === false || trim($value) === '') {
        throw new RuntimeException('Input is required.');
    }

    return trim($value);
};

$readPassword = static function (string $prompt): string {
    fwrite(STDOUT, $prompt);
    $isInteractiveUnix = DIRECTORY_SEPARATOR === '/' && stream_isatty(STDIN);
    if ($isInteractiveUnix) {
        shell_exec('stty -echo');
    }

    try {
        $value = fgets(STDIN);
    } finally {
        if ($isInteractiveUnix) {
            shell_exec('stty echo');
            fwrite(STDOUT, "\n");
        }
    }

    if ($value === false) {
        throw new RuntimeException('Password input failed.');
    }

    return rtrim($value, "\r\n");
};

try {
    $username = $readRequired('Username: ');
    $password = $readPassword('Password (16+ characters): ');
    $confirmation = $readPassword('Confirm password: ');
    if (!hash_equals($password, $confirmation)) {
        throw new RuntimeException('Passwords do not match.');
    }

    [$dsn, $databaseUser, $databasePassword] = DatabaseUrl::parse($databaseUrl);
    $pdo = new PDO($dsn, $databaseUser, $databasePassword, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $admin = (new AdminProvisioner(new PdoUserRepository($pdo)))->provision($username, $password);

    fwrite(STDOUT, "Administrator {$admin->username} is ready (id: {$admin->id}).\n");
} catch (Throwable $exception) {
    fwrite(STDERR, $exception->getMessage() . "\n");
    exit(1);
}
