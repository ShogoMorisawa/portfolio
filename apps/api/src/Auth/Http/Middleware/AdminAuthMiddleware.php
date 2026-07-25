<?php

declare(strict_types=1);

namespace App\Auth\Http\Middleware;

use App\Auth\Application\AccessTokenService;
use App\Auth\Http\AuthCookieNames;
use App\Shared\Application\ApiException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final readonly class AdminAuthMiddleware implements MiddlewareInterface
{
    public function __construct(
        private AccessTokenService $tokens,
        private AuthCookieNames $cookies,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $token = (string) ($request->getCookieParams()[$this->cookies->access] ?? '');
        if ($token === '') {
            throw new ApiException('AUTHENTICATION_REQUIRED', 'ログインが必要です', 401);
        }

        $claims = $this->tokens->verify($token);
        foreach ($claims as $name => $value) {
            $request = $request->withAttribute('auth_' . $name, $value);
        }

        return $handler->handle($request);
    }
}
