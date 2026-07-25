<?php

declare(strict_types=1);

namespace Tests\Unit\Auth\Infrastructure;

use App\Auth\Infrastructure\JwtAccessTokenService;
use App\Shared\Application\ApiException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class JwtAccessTokenServiceTest extends TestCase
{
    #[Test]
    public function itIssuesAndVerifiesAnAccessToken(): void
    {
        $service = new JwtAccessTokenService(str_repeat('a', 64));
        $issued = $service->issue(7, 'admin', 'session-family');
        $claims = $service->verify($issued['token']);

        self::assertSame(7, $claims['sub']);
        self::assertSame('admin', $claims['username']);
        self::assertSame('session-family', $claims['sid']);
        self::assertSame($issued['csrf_token'], $claims['csrf_token']);
        self::assertNotSame('', $claims['jti']);
    }

    #[Test]
    public function itRejectsATokenSignedWithAnotherKey(): void
    {
        $token = (new JwtAccessTokenService(str_repeat('a', 64)))->issue(1, 'admin', 'family')['token'];

        $this->expectException(ApiException::class);
        (new JwtAccessTokenService(str_repeat('b', 64)))->verify($token);
    }
}
