<?php

declare(strict_types=1);

namespace App\Shared\Http;

use App\Shared\Application\ApiException;
use Monolog\Logger;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Slim\Exception\HttpMethodNotAllowedException;
use Slim\Exception\HttpNotFoundException;
use Throwable;

final readonly class ErrorHandler
{
    public function __construct(
        private JsonResponse $json,
        private Logger $logger,
    ) {}

    public function __invoke(
        ServerRequestInterface $request,
        Throwable $exception,
        bool $displayErrorDetails,
        bool $logErrors,
        bool $logErrorDetails,
    ): ResponseInterface {
        $requestId = RequestData::requestId($request);

        if ($exception instanceof ApiException) {
            if ($exception->status >= 500) {
                $this->log($request, $exception, $requestId);
            }

            return $this->json->error(
                $exception->errorCode,
                $exception->getMessage(),
                $exception->status,
                $requestId,
                $exception->fields,
            );
        }

        if ($exception instanceof HttpNotFoundException) {
            return $this->json->error('NOT_FOUND', '指定されたリソースが見つかりません', 404, $requestId);
        }

        if ($exception instanceof HttpMethodNotAllowedException) {
            return $this->json->error('METHOD_NOT_ALLOWED', 'このHTTPメソッドは利用できません', 405, $requestId);
        }

        $this->log($request, $exception, $requestId);

        return $this->json->error('INTERNAL_ERROR', 'サーバーエラーが発生しました', 500, $requestId);
    }

    private function log(ServerRequestInterface $request, Throwable $exception, string $requestId): void
    {
        $this->logger->error('request_failed', [
            'request_id' => $requestId,
            'method' => $request->getMethod(),
            'path' => $request->getUri()->getPath(),
            'exception' => $exception::class,
            'message' => $exception->getMessage(),
        ]);
    }
}
