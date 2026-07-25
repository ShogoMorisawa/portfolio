<?php

declare(strict_types=1);

use App\Shared\Infrastructure\ParameterStoreLoader;

require dirname(__DIR__) . '/vendor/autoload.php';

ParameterStoreLoader::load();

$arguments = array_slice($argv, 1);
if ($arguments === []) {
    $arguments = ['apache2-foreground'];
}

if (getenv('AWS_LAMBDA_RUNTIME_API') !== false && $arguments === ['apache2-foreground']) {
    $runtimeDirectory = '/tmp/apache2';
    if (!is_dir($runtimeDirectory) && !mkdir($runtimeDirectory, 0700, true) && !is_dir($runtimeDirectory)) {
        throw new RuntimeException('Could not create the Apache runtime directory.');
    }

    putenv('APACHE_RUN_USER=#' . posix_geteuid());
    putenv('APACHE_RUN_GROUP=#' . posix_getegid());
    putenv("APACHE_PID_FILE={$runtimeDirectory}/apache2.pid");
    putenv("APACHE_RUN_DIR={$runtimeDirectory}");
    putenv("APACHE_LOCK_DIR={$runtimeDirectory}");
    putenv("APACHE_LOG_DIR={$runtimeDirectory}");

    pcntl_exec('/usr/sbin/apache2', ['-DFOREGROUND']);
    throw new RuntimeException('Could not start Apache in Lambda.');
}

pcntl_exec('/usr/local/bin/docker-php-entrypoint', $arguments);

throw new RuntimeException('Could not start Apache.');
