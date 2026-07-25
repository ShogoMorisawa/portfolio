<?php

declare(strict_types=1);

namespace App\Auth\Http\Middleware;

use App\Shared\Application\ApiException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class CsrfMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $expected = (string) $request->getAttribute('auth_csrf_token', '');
        $provided = trim($request->getHeaderLine('X-CSRF-Token'));

        if ($expected === '' || $provided === '' || !hash_equals($expected, $provided)) {
            throw new ApiException('CSRF_TOKEN_INVALID', 'CSRFトークンが正しくありません', 403);
        }

        return $handler->handle($request);
    }
}
