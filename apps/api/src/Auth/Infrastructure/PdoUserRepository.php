<?php

declare(strict_types=1);

namespace App\Auth\Infrastructure;

use App\Auth\Application\AdminCredentialRepository;
use App\Auth\Application\UserRepository;
use App\Auth\Model\AdminUser;
use PDO;

final readonly class PdoUserRepository implements AdminCredentialRepository, UserRepository
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

    public function upsertCredentials(string $username, string $passwordHash): AdminUser
    {
        $statement = $this->pdo->prepare(
            <<<'SQL'
INSERT INTO users (username, password_hash)
VALUES (:username, :password_hash)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
RETURNING id, username, password_hash
SQL,
        );
        $statement->execute(['username' => $username, 'password_hash' => $passwordHash]);
        $row = $statement->fetch();
        if (!is_array($row)) {
            throw new \RuntimeException('Administrator could not be saved.');
        }

        return $this->hydrate($row);
    }

    /**
     * @param array<string, mixed> $row
     */
    private function hydrate(array $row): AdminUser
    {
        return new AdminUser((int) $row['id'], (string) $row['username'], (string) $row['password_hash']);
    }
}
