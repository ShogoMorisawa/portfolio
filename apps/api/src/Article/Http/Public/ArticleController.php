<?php

declare(strict_types=1);

namespace App\Article\Http\Public;

use App\Article\Application\ArticleService;
use App\Shared\Http\JsonResponse;
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
            $this->articles->published(),
        ));
    }

    /**
     * @param array{slug: string} $args
     */
    public function show(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        return $this->json->success($this->articles->publishedBySlug($args['slug'])->toArray());
    }
}
