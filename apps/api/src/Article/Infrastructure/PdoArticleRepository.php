<?php

declare(strict_types=1);

namespace App\Article\Infrastructure;

use App\Article\Application\ArticleRepository;
use App\Article\Model\Article;
use DateTimeImmutable;
use JsonException;
use PDO;
use PDOException;

final readonly class PdoArticleRepository implements ArticleRepository
{
    private const SELECT = <<<'SQL'
SELECT id, slug, title, category, to_json(tags) AS tags, description, body, thumbnail_url,
       published_at, created_at, updated_at
FROM articles
SQL;

    public function __construct(private PDO $pdo) {}

    public function published(): array
    {
        return $this->fetchAll(self::SELECT . ' WHERE published_at IS NOT NULL ORDER BY published_at DESC');
    }

    public function findPublishedBySlug(string $slug): ?Article
    {
        return $this->fetchOne(self::SELECT . ' WHERE slug = :slug AND published_at IS NOT NULL', ['slug' => $slug]);
    }

    public function all(): array
    {
        return $this->fetchAll(self::SELECT . ' ORDER BY COALESCE(published_at, created_at) DESC');
    }

    public function findById(int $id): ?Article
    {
        return $this->fetchOne(self::SELECT . ' WHERE id = :id', ['id' => $id]);
    }

    public function create(array $data): Article
    {
        try {
            $statement = $this->pdo->prepare(
                <<<'SQL'
INSERT INTO articles (
    slug, title, category, tags, description, body, thumbnail_url, published_at, updated_at
)
VALUES (
    :slug, :title, :category,
    ARRAY(SELECT jsonb_array_elements_text(CAST(:tags AS jsonb))),
    :description, CAST(:body AS jsonb), :thumbnail_url,
    CASE WHEN :publish THEN CURRENT_TIMESTAMP ELSE NULL END,
    CURRENT_TIMESTAMP
)
RETURNING id
SQL,
            );
            $statement->execute($this->parameters($data));
        } catch (PDOException $exception) {
            if ($exception->getCode() === '23505') {
                throw new \App\Shared\Application\ApiException('SLUG_ALREADY_EXISTS', 'このスラッグは使用済みです', 409);
            }
            throw $exception;
        }

        return $this->findById((int) $statement->fetchColumn())
            ?? throw new \RuntimeException('Created article could not be loaded.');
    }

    public function update(int $id, array $data): ?Article
    {
        $statement = $this->pdo->prepare(
            <<<'SQL'
UPDATE articles
SET title = :title,
    category = :category,
    tags = ARRAY(SELECT jsonb_array_elements_text(CAST(:tags AS jsonb))),
    description = :description,
    body = CAST(:body AS jsonb),
    thumbnail_url = :thumbnail_url,
    published_at = CASE
        WHEN published_at IS NOT NULL THEN published_at
        WHEN :publish THEN CURRENT_TIMESTAMP
        ELSE NULL
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :id
RETURNING id
SQL,
        );
        $statement->execute($this->parameters($data, false) + ['id' => $id]);

        return $statement->fetchColumn() === false ? null : $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->pdo->prepare('DELETE FROM articles WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() === 1;
    }

    /**
     * @param array<string, mixed> $data
     *
     * @return array<string, mixed>
     */
    private function parameters(array $data, bool $includeSlug = true): array
    {
        $parameters = [
            'title' => $data['title'],
            'category' => $data['category'],
            'tags' => json_encode($data['tags'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
            'description' => $data['description'],
            'body' => json_encode($data['body'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'thumbnail_url' => $data['thumbnail_url'],
            'publish' => $data['publish'] ? 'true' : 'false',
        ];
        if ($includeSlug) {
            $parameters['slug'] = $data['slug'];
        }

        return $parameters;
    }

    /**
     * @param array<string, scalar|null> $parameters
     *
     * @return list<Article>
     */
    private function fetchAll(string $sql, array $parameters = []): array
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($parameters);

        return array_values(array_map(fn(array $row): Article => $this->hydrate($row), $statement->fetchAll()));
    }

    /**
     * @param array<string, scalar|null> $parameters
     */
    private function fetchOne(string $sql, array $parameters): ?Article
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($parameters);
        $row = $statement->fetch();

        return is_array($row) ? $this->hydrate($row) : null;
    }

    /**
     * @param array<string, mixed> $row
     *
     * @throws JsonException
     */
    private function hydrate(array $row): Article
    {
        $tags = json_decode((string) ($row['tags'] ?? '[]'), true, 32, JSON_THROW_ON_ERROR);
        $body = is_string($row['body'])
            ? json_decode($row['body'], true, 64, JSON_THROW_ON_ERROR)
            : $row['body'];

        return new Article(
            (int) $row['id'],
            (string) $row['slug'],
            (string) $row['title'],
            (string) $row['category'],
            is_array($tags) ? array_values($tags) : [],
            (string) ($row['description'] ?? ''),
            is_array($body) ? $body : [],
            isset($row['thumbnail_url']) ? (string) $row['thumbnail_url'] : null,
            isset($row['published_at']) ? new DateTimeImmutable((string) $row['published_at']) : null,
            new DateTimeImmutable((string) $row['created_at']),
            new DateTimeImmutable((string) $row['updated_at']),
        );
    }
}
