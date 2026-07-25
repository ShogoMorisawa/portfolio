<?php

declare(strict_types=1);

namespace App\Letter\Model;

use DateTimeImmutable;

final readonly class Letter
{
    public function __construct(
        public int $id,
        public ?int $letterboxId,
        public ?string $legacyVisitorId,
        public string $name,
        public ?string $email,
        public string $message,
        public ?string $reply,
        public ?DateTimeImmutable $repliedAt,
        public bool $replyRead,
        public DateTimeImmutable $createdAt,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'message' => $this->message,
            'reply' => $this->reply,
            'replied_at' => $this->repliedAt?->format(DATE_ATOM),
            'reply_read' => $this->replyRead,
            'created_at' => $this->createdAt->format(DATE_ATOM),
            'legacy' => $this->letterboxId === null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicReplyArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'message' => $this->message,
            'reply' => $this->reply,
            'replied_at' => $this->repliedAt?->format(DATE_ATOM),
            'created_at' => $this->createdAt->format(DATE_ATOM),
        ];
    }
}
