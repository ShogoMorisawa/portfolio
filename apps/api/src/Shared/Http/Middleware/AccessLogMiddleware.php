<?php

declare(strict_types=1);

namespace App\Shared\Http\Middleware;

use App\Shared\Http\RequestData;
use Monolog\Logger;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final readonly class AccessLogMiddleware implements MiddlewareInterface
{
    public function __construct(private Logger $logger) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $startedAt = hrtime(true);
        $response = $handler->handle($request);

        $this->logger->info('request_completed', [
            'request_id' => RequestData::requestId($request),
            'method' => $request->getMethod(),
            'path' => $request->getUri()->getPath(),
            'status' => $response->getStatusCode(),
            'duration_ms' => round((hrtime(true) - $startedAt) / 1_000_000, 2),
        ]);

        return $response;
    }
}
