<?php

declare(strict_types=1);

namespace App\Article\Application;

use App\Article\Model\Article;

interface ArticleRepository
{
    /**
     * @return list<Article>
     */
    public function published(): array;

    public function findPublishedBySlug(string $slug): ?Article;

    /**
     * @return list<Article>
     */
    public function all(): array;

    public function findById(int $id): ?Article;

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): Article;

    /**
     * @param array<string, mixed> $data
     */
    public function update(int $id, array $data): ?Article;

    public function delete(int $id): bool;
}
