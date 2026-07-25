<?php

declare(strict_types=1);

namespace App\Shared\Infrastructure;

use RuntimeException;

final class DatabaseUrl
{
    /**
     * @return array{string, string, string}
     */
    public static function parse(string $url): array
    {
        $parts = parse_url($url);
        if ($parts === false || !isset($parts['host'], $parts['path'], $parts['user'])) {
            throw new RuntimeException('DATABASE_URL is invalid.');
        }

        $host = $parts['host'];
        $port = (int) ($parts['port'] ?? 5432);
        $database = ltrim($parts['path'], '/');
        $user = rawurldecode($parts['user']);
        $password = rawurldecode($parts['pass'] ?? '');
        parse_str($parts['query'] ?? '', $query);
        $sslMode = is_string($query['sslmode'] ?? null) ? $query['sslmode'] : 'require';

        return ["pgsql:host={$host};port={$port};dbname={$database};sslmode={$sslMode}", $user, $password];
    }
}
