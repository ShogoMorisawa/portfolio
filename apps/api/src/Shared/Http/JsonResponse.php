<?php

declare(strict_types=1);

namespace App\Shared\Http;

use JsonException;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;

final readonly class JsonResponse
{
    public function __construct(private ResponseFactoryInterface $factory) {}

    /**
     * @param array<string, mixed>|list<mixed> $data
     *
     * @throws JsonException
     */
    public function create(array $data, int $status = 200): ResponseInterface
    {
        $response = $this->factory->createResponse($status)
            ->withHeader('Content-Type', 'application/json; charset=utf-8');
        $response->getBody()->write(json_encode(
            $data,
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE,
        ));

        return $response;
    }

    /**
     * @param array<string, mixed>|list<mixed>|null $data
     */
    public function success(?array $data, int $status = 200): ResponseInterface
    {
        if ($status === 204) {
            return $this->factory->createResponse(204);
        }

        return $this->create(['data' => $data], $status);
    }

    /**
     * @param array<string, list<string>> $fields
     *
     * @throws JsonException
     */
    public function error(
        string $code,
        string $message,
        int $status,
        string $requestId,
        array $fields = [],
    ): ResponseInterface {
        $error = [
            'code' => $code,
            'message' => $message,
            'requestId' => $requestId,
        ];
        if ($fields !== []) {
            $error['fields'] = $fields;
        }

        return $this->create(['error' => $error], $status);
    }
}
