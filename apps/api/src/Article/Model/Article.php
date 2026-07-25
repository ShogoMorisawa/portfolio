<?php

declare(strict_types=1);

namespace App\Article\Model;

use DateTimeImmutable;

final readonly class Article
{
    /**
     * @param list<string> $tags
     * @param array<string, mixed> $body
     */
    public function __construct(
        public int $id,
        public string $slug,
        public string $title,
        public string $category,
        public array $tags,
        public string $description,
        public array $body,
        public ?string $thumbnailUrl,
        public ?DateTimeImmutable $publishedAt,
        public DateTimeImmutable $createdAt,
        public DateTimeImmutable $updatedAt,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(bool $withBody = true): array
    {
        $data = [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'category' => $this->category,
            'tags' => $this->tags,
            'description' => $this->description,
            'thumbnail_url' => $this->thumbnailUrl,
            'published_at' => $this->publishedAt?->format(DATE_ATOM),
            'created_at' => $this->createdAt->format(DATE_ATOM),
            'updated_at' => $this->updatedAt->format(DATE_ATOM),
        ];
        if ($withBody) {
            $data['body'] = $this->body;
        }

        return $data;
    }
}
