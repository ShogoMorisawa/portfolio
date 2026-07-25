<?php

declare(strict_types=1);

namespace App\Auth\Application;

final readonly class AuthResult
{
    public function __construct(
        public int $userId,
        public string $username,
        public string $accessToken,
        public string $refreshToken,
        public string $csrfToken,
        public int $accessMaxAge,
        public int $refreshMaxAge,
    ) {}
}
