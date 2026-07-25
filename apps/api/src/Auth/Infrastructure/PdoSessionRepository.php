<?php

declare(strict_types=1);

namespace App\Auth\Infrastructure;

use App\Auth\Application\SessionRepository;
use App\Shared\Application\ApiException;
use DateTimeImmutable;
use PDO;

final readonly class PdoSessionRepository implements SessionRepository
{
    public function __construct(private PDO $pdo) {}

    public function create(
        string $familyId,
        int $userId,
        string $tokenHash,
        DateTimeImmutable $expiresAt,
    ): void {
        $statement = $this->pdo->prepare(
            <<<'SQL'
INSERT INTO admin_sessions (family_id, user_id, token_hash, expires_at)
VALUES (CAST(:family_id AS uuid), :user_id, :token_hash, :expires_at)
SQL,
        );
        $statement->execute([
            'family_id' => $familyId,
            'user_id' => $userId,
            'token_hash' => $tokenHash,
            'expires_at' => $expiresAt->format('Y-m-d H:i:s'),
        ]);
    }

    public function rotate(string $currentHash, string $newHash, DateTimeImmutable $now): array
    {
        $statement = $this->pdo->prepare(
            <<<'SQL'
SELECT family_id::text, user_id, expires_at, used_at, revoked_at
FROM admin_sessions
WHERE token_hash = :token_hash
FOR UPDATE
SQL,
        );
        $statement->execute(['token_hash' => $currentHash]);
        $session = $statement->fetch();

        if (!is_array($session)) {
            throw new ApiException('SESSION_INVALID', 'ログインし直してください', 401);
        }

        $familyId = (string) $session['family_id'];
        if ($session['used_at'] !== null || $session['revoked_at'] !== null) {
            $this->revokeFamily($familyId, $now);

            return ['error' => 'reuse'];
        }

        $expiresAt = new DateTimeImmutable((string) $session['expires_at']);
        if ($expiresAt <= $now) {
            $this->revokeFamily($familyId, $now);

            return ['error' => 'expired'];
        }

        $use = $this->pdo->prepare(
            'UPDATE admin_sessions SET used_at = :now WHERE token_hash = :token_hash',
        );
        $use->execute([
            'now' => $now->format('Y-m-d H:i:s'),
            'token_hash' => $currentHash,
        ]);

        $this->create($familyId, (int) $session['user_id'], $newHash, $expiresAt);

        return [
            'family_id' => $familyId,
            'user_id' => (int) $session['user_id'],
            'expires_at' => $expiresAt,
        ];
    }

    public function revokeByTokenHash(string $tokenHash, DateTimeImmutable $now): void
    {
        $statement = $this->pdo->prepare(
            'UPDATE admin_sessions SET revoked_at = COALESCE(revoked_at, :now) WHERE token_hash = :token_hash',
        );
        $statement->execute([
            'now' => $now->format('Y-m-d H:i:s'),
            'token_hash' => $tokenHash,
        ]);
    }

    private function revokeFamily(string $familyId, DateTimeImmutable $now): void
    {
        $statement = $this->pdo->prepare(
            <<<'SQL'
UPDATE admin_sessions
SET revoked_at = COALESCE(revoked_at, :now)
WHERE family_id = CAST(:family_id AS uuid)
SQL,
        );
        $statement->execute([
            'now' => $now->format('Y-m-d H:i:s'),
            'family_id' => $familyId,
        ]);
    }
}
