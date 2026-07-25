<?php

declare(strict_types=1);

namespace App\Article\Application;

use App\Article\Model\Article;
use App\Shared\Application\ApiException;
use App\Shared\Application\AuditLogger;

final readonly class ArticleService
{
    public function __construct(
        private ArticleRepository $articles,
        private ArticleValidator $validator,
        private AuditLogger $audit,
    ) {}

    /**
     * @return list<Article>
     */
    public function published(): array
    {
        return $this->articles->published();
    }

    public function publishedBySlug(string $slug): Article
    {
        return $this->articles->findPublishedBySlug($slug)
            ?? throw new ApiException('ARTICLE_NOT_FOUND', '記事が見つかりません', 404);
    }

    /**
     * @return list<Article>
     */
    public function all(): array
    {
        return $this->articles->all();
    }

    public function byId(int $id): Article
    {
        return $this->articles->findById($id)
            ?? throw new ApiException('ARTICLE_NOT_FOUND', '記事が見つかりません', 404);
    }

    /**
     * @param array<string, mixed> $input
     */
    public function create(array $input, int $actorId, string $requestId): Article
    {
        $article = $this->articles->create($this->validator->validate($input, true));
        $this->audit->record('article.created', $actorId, 'article', (string) $article->id, $requestId);
        if ($article->publishedAt !== null) {
            $this->audit->record('article.published', $actorId, 'article', (string) $article->id, $requestId);
        }

        return $article;
    }

    /**
     * @param array<string, mixed> $input
     */
    public function update(int $id, array $input, int $actorId, string $requestId): Article
    {
        $existing = $this->byId($id);
        if (isset($input['slug']) && trim((string) $input['slug']) !== $existing->slug) {
            throw new ApiException('SLUG_IMMUTABLE', '保存後のスラッグは変更できません', 409);
        }

        $data = $this->validator->validate($input + ['slug' => $existing->slug], false);
        $article = $this->articles->update($id, $data)
            ?? throw new ApiException('ARTICLE_NOT_FOUND', '記事が見つかりません', 404);
        $this->audit->record('article.updated', $actorId, 'article', (string) $id, $requestId);
        if ($existing->publishedAt === null && $article->publishedAt !== null) {
            $this->audit->record('article.published', $actorId, 'article', (string) $id, $requestId);
        }

        return $article;
    }

    public function delete(int $id, int $actorId, string $requestId): void
    {
        if (!$this->articles->delete($id)) {
            throw new ApiException('ARTICLE_NOT_FOUND', '記事が見つかりません', 404);
        }
        $this->audit->record('article.deleted', $actorId, 'article', (string) $id, $requestId);
    }
}
