<?php

declare(strict_types=1);

namespace App\Article\Http\Admin;

use App\Article\Application\ArticleService;
use App\Shared\Application\ApiException;
use App\Shared\Http\JsonResponse;
use App\Shared\Http\RequestData;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final readonly class ArticleController
{
    public function __construct(
        private ArticleService $articles,
        private JsonResponse $json,
    ) {}

    public function index(): ResponseInterface
    {
        return $this->json->success(array_map(
            static fn($article): array => $article->toArray(false),
            $this->articles->all(),
        ));
    }

    /**
     * @param array{id: string} $args
     */
    public function show(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        return $this->json->success($this->articles->byId($this->id($args['id']))->toArray());
    }

    public function create(ServerRequestInterface $request): ResponseInterface
    {
        $article = $this->articles->create(
            RequestData::json($request),
            (int) $request->getAttribute('auth_sub'),
            RequestData::requestId($request),
        );

        return $this->json->success($article->toArray(), 201);
    }

    /**
     * @param array{id: string} $args
     */
    public function update(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $article = $this->articles->update(
            $this->id($args['id']),
            RequestData::json($request),
            (int) $request->getAttribute('auth_sub'),
            RequestData::requestId($request),
        );

        return $this->json->success($article->toArray());
    }

    /**
     * @param array{id: string} $args
     */
    public function delete(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $this->articles->delete(
            $this->id($args['id']),
            (int) $request->getAttribute('auth_sub'),
            RequestData::requestId($request),
        );

        return $this->json->success(null, 204);
    }

    private function id(string $id): int
    {
        if (!ctype_digit($id) || (int) $id < 1) {
            throw new ApiException('ARTICLE_NOT_FOUND', '記事が見つかりません', 404);
        }

        return (int) $id;
    }
}
