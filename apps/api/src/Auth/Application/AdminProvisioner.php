<?php

declare(strict_types=1);

namespace App\Auth\Application;

use App\Auth\Model\AdminUser;
use InvalidArgumentException;

final readonly class AdminProvisioner
{
    public function __construct(private AdminCredentialRepository $credentials) {}

    public function provision(string $username, string $password): AdminUser
    {
        $username = trim($username);
        if (preg_match('/\A[a-zA-Z0-9._-]{3,64}\z/', $username) !== 1) {
            throw new InvalidArgumentException(
                'Username must be 3-64 characters using letters, numbers, dot, underscore, or hyphen.',
            );
        }
        if (strlen($password) < 16) {
            throw new InvalidArgumentException('Password must be at least 16 characters.');
        }

        $passwordHash = password_hash($password, PASSWORD_ARGON2ID);

        return $this->credentials->upsertCredentials($username, $passwordHash);
    }
}
