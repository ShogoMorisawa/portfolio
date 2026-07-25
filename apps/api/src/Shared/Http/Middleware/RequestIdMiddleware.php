<?php

declare(strict_types=1);

namespace App\Shared\Http\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class RequestIdMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $requestId = trim($request->getHeaderLine('X-Request-Id'));
        if ($requestId === '' || strlen($requestId) > 120) {
            $requestId = bin2hex(random_bytes(16));
        }

        return $handler
            ->handle($request->withAttribute('request_id', $requestId))
            ->withHeader('X-Request-Id', $requestId);
    }
}
