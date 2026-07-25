<?php

declare(strict_types=1);

namespace App\Auth\Model;

final readonly class AdminUser
{
    public function __construct(
        public int $id,
        public string $username,
        public string $passwordHash,
    ) {}
}
