<?php

declare(strict_types=1);

namespace App\Auth\Application;

use App\Auth\Model\AdminUser;

interface UserRepository
{
    public function findByUsername(string $username): ?AdminUser;

    public function findById(int $id): ?AdminUser;

    public function updatePasswordHash(int $id, string $passwordHash): void;
}
