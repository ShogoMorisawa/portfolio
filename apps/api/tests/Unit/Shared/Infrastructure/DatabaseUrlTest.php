<?php

declare(strict_types=1);

namespace Tests\Unit\Shared\Infrastructure;

use App\Shared\Infrastructure\DatabaseUrl;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class DatabaseUrlTest extends TestCase
{
    #[Test]
    public function itParsesEncodedCredentialsAndConnectionOptions(): void
    {
        [$dsn, $username, $password] = DatabaseUrl::parse(
            'postgresql://admin%40example.com:p%40ss%2Fword@db.example.com:6432/portfolio?sslmode=verify-full',
        );

        self::assertSame(
            'pgsql:host=db.example.com;port=6432;dbname=portfolio;sslmode=verify-full',
            $dsn,
        );
        self::assertSame('admin@example.com', $username);
        self::assertSame('p@ss/word', $password);
    }
}
