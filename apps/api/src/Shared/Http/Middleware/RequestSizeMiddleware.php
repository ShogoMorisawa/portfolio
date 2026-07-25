<?php

declare(strict_types=1);

namespace App\Shared\Http\Middleware;

use App\Shared\Application\ApiException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class RequestSizeMiddleware implements MiddlewareInterface
{
    private const JSON_MAX_BYTES = 1_048_576;
    private const MULTIPART_MAX_BYTES = 4_194_304;

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $length = (int) $request->getHeaderLine('Content-Length');
        $contentType = strtolower($request->getHeaderLine('Content-Type'));
        $limit = str_starts_with($contentType, 'multipart/form-data')
            ? self::MULTIPART_MAX_BYTES
            : self::JSON_MAX_BYTES;

        if ($length > $limit) {
            throw new ApiException('PAYLOAD_TOO_LARGE', 'リクエストのサイズが上限を超えています', 413);
        }

        return $handler->handle($request);
    }
}
