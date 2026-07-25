<?php

declare(strict_types=1);

namespace App\Letter\Infrastructure;

use App\Letter\Application\LetterboxRepository;
use DateTimeImmutable;
use PDO;

final readonly class PdoLetterboxRepository implements LetterboxRepository
{
    public function __construct(private PDO $pdo) {}

    public function findValidId(string $tokenHash, DateTimeImmutable $now): ?int
    {
        $statement = $this->pdo->prepare(
            <<<'SQL'
UPDATE letterboxes
SET last_seen_at = :now
WHERE token_hash = :token_hash AND expires_at > :now
RETURNING id
SQL,
        );
        $statement->execute([
            'token_hash' => $tokenHash,
            'now' => $now->format('Y-m-d H:i:s'),
        ]);
        $id = $statement->fetchColumn();

        return $id === false ? null : (int) $id;
    }

    public function create(string $tokenHash, DateTimeImmutable $expiresAt): int
    {
        $statement = $this->pdo->prepare(
            'INSERT INTO letterboxes (token_hash, expires_at) VALUES (:token_hash, :expires_at) RETURNING id',
        );
        $statement->execute([
            'token_hash' => $tokenHash,
            'expires_at' => $expiresAt->format('Y-m-d H:i:s'),
        ]);

        return (int) $statement->fetchColumn();
    }
}
