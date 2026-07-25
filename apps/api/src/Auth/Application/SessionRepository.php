<?php

declare(strict_types=1);

namespace App\Auth\Application;

use DateTimeImmutable;

interface SessionRepository
{
    public function create(
        string $familyId,
        int $userId,
        string $tokenHash,
        DateTimeImmutable $expiresAt,
    ): void;

    /**
     * @return array{family_id: string, user_id: int, expires_at: DateTimeImmutable}|array{error: 'expired'|'reuse'}
     */
    public function rotate(string $currentHash, string $newHash, DateTimeImmutable $now): array;

    public function revokeByTokenHash(string $tokenHash, DateTimeImmutable $now): void;
}
