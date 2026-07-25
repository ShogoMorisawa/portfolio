<?php

declare(strict_types=1);

namespace App\Letter\Application;

use App\Letter\Model\Letter;

interface LetterRepository
{
    public function create(int $letterboxId, string $name, ?string $email, string $message): Letter;

    /**
     * @return list<Letter>
     */
    public function unreadReplies(int $letterboxId): array;

    /**
     * @param list<int> $ids
     */
    public function markRepliesRead(int $letterboxId, array $ids): int;

    /**
     * @return array{items: list<Letter>, total: int}
     */
    public function page(int $page, int $limit): array;

    public function reply(int $id, string $reply): ?Letter;

    public function delete(int $id): bool;
}
