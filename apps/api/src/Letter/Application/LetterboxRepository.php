<?php

declare(strict_types=1);

namespace App\Letter\Application;

use DateTimeImmutable;

interface LetterboxRepository
{
    public function findValidId(string $tokenHash, DateTimeImmutable $now): ?int;

    public function create(string $tokenHash, DateTimeImmutable $expiresAt): int;
}
