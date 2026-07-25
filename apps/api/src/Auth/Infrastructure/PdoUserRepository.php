<?php

declare(strict_types=1);

namespace App\Auth\Infrastructure;

use App\Auth\Application\UserRepository;
use App\Auth\Model\AdminUser;
use PDO;

final readonly class PdoUserRepository implements UserRepository
{
    public function __construct(private PDO $pdo) {}

    public function findByUsername(string $username): ?AdminUser
    {
        $statement = $this->pdo->prepare(
            'SELECT id, username, password_hash FROM users WHERE username = :username LIMIT 1',
        );
        $statement->execute(['username' => $username]);
        $row = $statement->fetch();

        return is_array($row) ? $this->hydrate($row) : null;
    }

    public function findById(int $id): ?AdminUser
    {
        $statement = $this->pdo->prepare(
            'SELECT id, username, password_hash FROM users WHERE id = :id LIMIT 1',
        );
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();

        return is_array($row) ? $this->hydrate($row) : null;
    }

    public function updatePasswordHash(int $id, string $passwordHash): void
    {
        $statement = $this->pdo->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :id');
        $statement->execute(['id' => $id, 'password_hash' => $passwordHash]);
    }

    /**
     * @param array<string, mixed> $row
     */
    private function hydrate(array $row): AdminUser
    {
        return new AdminUser((int) $row['id'], (string) $row['username'], (string) $row['password_hash']);
    }
}
