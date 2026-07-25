<?php

declare(strict_types=1);

namespace App\Shared\Infrastructure;

use PDO;

final class Database
{
    private ?PDO $connection = null;

    public function __construct(private readonly Config $config) {}

    public function connection(): PDO
    {
        return $this->connection ??= new PDO(
            $this->config->databaseDsn,
            $this->config->databaseUser,
            $this->config->databasePassword,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ],
        );
    }
}
