<?php

declare(strict_types=1);

namespace App\Auth\Application;

use App\Auth\Model\AdminUser;

interface AdminCredentialRepository
{
    public function upsertCredentials(string $username, string $passwordHash): AdminUser;
}
