<?php

declare(strict_types=1);

namespace App\Shared\Http\Middleware;

use App\Shared\Infrastructure\Config;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final readonly class CorsMiddleware implements MiddlewareInterface
{
    public function __construct(
        private Config $config,
        private ResponseFactoryInterface $responseFactory,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $origin = rtrim($request->getHeaderLine('Origin'), '/');
        $allowed = $origin !== '' && in_array($origin, $this->config->allowedOrigins, true);

        if ($request->getMethod() === 'OPTIONS') {
            $response = $this->responseFactory->createResponse($allowed ? 204 : 403);
        } elseif ($origin !== '' && !$allowed) {
            $response = $this->responseFactory->createResponse(403);
        } else {
            $response = $handler->handle($request);
        }

        $response = $response->withHeader('Vary', 'Origin');
        if (!$allowed) {
            return $response;
        }

        return $response
            ->withHeader('Access-Control-Allow-Origin', $origin)
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token, X-Request-Id')
            ->withHeader('Access-Control-Max-Age', '600');
    }
}
