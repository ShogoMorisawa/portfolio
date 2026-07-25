<?php

declare(strict_types=1);

namespace App\Auth\Application;

interface AccessTokenService
{
    /**
     * @return array{token: string, csrf_token: string}
     */
    public function issue(int $userId, string $username, string $familyId): array;

    /**
     * @return array{sub: int, username: string, sid: string, csrf_token: string, jti: string}
     */
    public function verify(string $token): array;
}
