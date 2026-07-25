<?php

declare(strict_types=1);

namespace App\Letter\Http\Admin;

use App\Letter\Application\LetterService;
use App\Shared\Application\ApiException;
use App\Shared\Http\JsonResponse;
use App\Shared\Http\RequestData;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final readonly class LetterController
{
    public function __construct(
        private LetterService $letters,
        private JsonResponse $json,
    ) {}

    public function index(ServerRequestInterface $request): ResponseInterface
    {
        $query = $request->getQueryParams();
        $result = $this->letters->adminPage((int) ($query['page'] ?? 1), (int) ($query['limit'] ?? 20));

        return $this->json->success([
            'items' => array_map(static fn($letter): array => $letter->toAdminArray(), $result['items']),
            'total' => $result['total'],
            'page' => $result['page'],
            'limit' => $result['limit'],
        ]);
    }

    /**
     * @param array{id: string} $args
     */
    public function reply(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $body = RequestData::json($request);
        $letter = $this->letters->reply(
            $this->id($args['id']),
            (string) ($body['reply'] ?? ''),
            (int) $request->getAttribute('auth_sub'),
            RequestData::requestId($request),
        );

        return $this->json->success($letter->toAdminArray());
    }

    /**
     * @param array{id: string} $args
     */
    public function delete(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $this->letters->delete(
            $this->id($args['id']),
            (int) $request->getAttribute('auth_sub'),
            RequestData::requestId($request),
        );

        return $this->json->success(null, 204);
    }

    private function id(string $id): int
    {
        if (!ctype_digit($id) || (int) $id < 1) {
            throw new ApiException('LETTER_NOT_FOUND', '手紙が見つかりません', 404);
        }

        return (int) $id;
    }
}
