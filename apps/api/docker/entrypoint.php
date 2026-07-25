<?php

declare(strict_types=1);

use App\Shared\Infrastructure\ParameterStoreLoader;

require '/var/www/html/vendor/autoload.php';

ParameterStoreLoader::load();

$arguments = array_slice($argv, 1);
if ($arguments === []) {
    $arguments = ['apache2-foreground'];
}

pcntl_exec('/usr/local/bin/docker-php-entrypoint', $arguments);

throw new RuntimeException('Could not start Apache.');
