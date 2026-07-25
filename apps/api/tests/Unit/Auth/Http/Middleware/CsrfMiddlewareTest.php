<?php

declare(strict_types=1);

namespace Tests\Unit\Auth\Http\Middleware;

use App\Auth\Http\Middleware\CsrfMiddleware;
use App\Shared\Application\ApiException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Psr7\Factory\ServerRequestFactory;

final class CsrfMiddlewareTest extends TestCase
{
    #[Test]
    public function itAllowsAMatchingCsrfToken(): void
    {
        $request = $this->request()
            ->withAttribute('auth_csrf_token', 'expected-token')
            ->withHeader('X-CSRF-Token', 'expected-token');

        $response = (new CsrfMiddleware())->process($request, $this->handler());

        self::assertSame(204, $response->getStatusCode());
    }

    #[Test]
    public function itRejectsAMissingOrMismatchedCsrfToken(): void
    {
        $request = $this->request()
            ->withAttribute('auth_csrf_token', 'expected-token')
            ->withHeader('X-CSRF-Token', 'wrong-token');

        try {
            (new CsrfMiddleware())->process($request, $this->handler());
            self::fail('A mismatched CSRF token must be rejected.');
        } catch (ApiException $exception) {
            self::assertSame('CSRF_TOKEN_INVALID', $exception->errorCode);
            self::assertSame(403, $exception->status);
        }
    }

    private function request(): ServerRequestInterface
    {
        return (new ServerRequestFactory())->createServerRequest('POST', '/admin/articles');
    }

    private function handler(): RequestHandlerInterface
    {
        return new class implements RequestHandlerInterface {
            public function handle(ServerRequestInterface $request): ResponseInterface
            {
                return (new ResponseFactory())->createResponse(204);
            }
        };
    }
}
