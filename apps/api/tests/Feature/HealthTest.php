<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Bootstrap\AppFactory;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Slim\Psr7\Factory\ServerRequestFactory;

final class HealthTest extends TestCase
{
    protected function setUp(): void
    {
        putenv('APP_ENV=local');
        putenv('APP_DEBUG=false');
        putenv('JWT_SIGNING_KEY=' . str_repeat('a', 64));
        putenv('ALLOWED_ORIGINS=http://localhost:3000');
        putenv('AWS_EC2_METADATA_DISABLED=true');
    }

    #[Test]
    public function healthEndpointDoesNotRequireTheDatabase(): void
    {
        $response = AppFactory::create()->handle(
            (new ServerRequestFactory())->createServerRequest('GET', '/health'),
        );

        self::assertSame(200, $response->getStatusCode());
        self::assertSame(['data' => ['status' => 'ok']], json_decode((string) $response->getBody(), true));
    }

    #[Test]
    public function adminEndpointRequiresAnAccessCookie(): void
    {
        $response = AppFactory::create()->handle(
            (new ServerRequestFactory())->createServerRequest('GET', '/admin/articles'),
        );
        $payload = json_decode((string) $response->getBody(), true);

        self::assertSame(401, $response->getStatusCode());
        self::assertSame('AUTHENTICATION_REQUIRED', $payload['error']['code']);
    }
}
