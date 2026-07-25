<?php

declare(strict_types=1);

namespace App\Letter\Infrastructure;

use App\Letter\Application\LetterRepository;
use App\Letter\Model\Letter;
use DateTimeImmutable;
use PDO;

final readonly class PdoLetterRepository implements LetterRepository
{
    private const SELECT = <<<'SQL'
SELECT id, letterbox_id, visitor_id, name, email, message, reply, replied_at, reply_read, created_at
FROM letters
SQL;

    public function __construct(private PDO $pdo) {}

    public function create(int $letterboxId, string $name, ?string $email, string $message): Letter
    {
        $statement = $this->pdo->prepare(
            <<<'SQL'
INSERT INTO letters (letterbox_id, visitor_id, name, email, message)
VALUES (:letterbox_id, NULL, :name, :email, :message)
RETURNING id
SQL,
        );
        $statement->execute([
            'letterbox_id' => $letterboxId,
            'name' => $name,
            'email' => $email,
            'message' => $message,
        ]);

        return $this->find((int) $statement->fetchColumn())
            ?? throw new \RuntimeException('Created letter could not be loaded.');
    }

    public function unreadReplies(int $letterboxId): array
    {
        $statement = $this->pdo->prepare(
            self::SELECT . <<<'SQL'
 WHERE letterbox_id = :letterbox_id
   AND reply IS NOT NULL
   AND reply_read = FALSE
 ORDER BY replied_at ASC
SQL,
        );
        $statement->execute(['letterbox_id' => $letterboxId]);

        return array_values(array_map(fn(array $row): Letter => $this->hydrate($row), $statement->fetchAll()));
    }

    public function markRepliesRead(int $letterboxId, array $ids): int
    {
        $placeholders = implode(', ', array_fill(0, count($ids), '?'));
        $statement = $this->pdo->prepare(
            "UPDATE letters SET reply_read = TRUE WHERE letterbox_id = ? AND reply IS NOT NULL AND id IN ({$placeholders})",
        );
        $statement->execute([$letterboxId, ...$ids]);

        return $statement->rowCount();
    }

    public function page(int $page, int $limit): array
    {
        $countStatement = $this->pdo->query('SELECT COUNT(*) FROM letters');
        if ($countStatement === false) {
            throw new \RuntimeException('Letter count query failed.');
        }
        $count = (int) $countStatement->fetchColumn();
        $statement = $this->pdo->prepare(
            self::SELECT . ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset',
        );
        $statement->bindValue('limit', $limit, PDO::PARAM_INT);
        $statement->bindValue('offset', ($page - 1) * $limit, PDO::PARAM_INT);
        $statement->execute();

        return [
            'items' => array_values(array_map(
                fn(array $row): Letter => $this->hydrate($row),
                $statement->fetchAll(),
            )),
            'total' => $count,
        ];
    }

    public function reply(int $id, string $reply): ?Letter
    {
        $statement = $this->pdo->prepare(
            <<<'SQL'
UPDATE letters
SET reply = :reply, replied_at = CURRENT_TIMESTAMP, reply_read = FALSE
WHERE id = :id
RETURNING id
SQL,
        );
        $statement->execute(['id' => $id, 'reply' => $reply]);

        return $statement->fetchColumn() === false ? null : $this->find($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->pdo->prepare('DELETE FROM letters WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() === 1;
    }

    private function find(int $id): ?Letter
    {
        $statement = $this->pdo->prepare(self::SELECT . ' WHERE id = :id');
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();

        return is_array($row) ? $this->hydrate($row) : null;
    }

    /**
     * @param array<string, mixed> $row
     */
    private function hydrate(array $row): Letter
    {
        return new Letter(
            (int) $row['id'],
            isset($row['letterbox_id']) ? (int) $row['letterbox_id'] : null,
            isset($row['visitor_id']) ? (string) $row['visitor_id'] : null,
            (string) ($row['name'] ?? ''),
            isset($row['email']) ? (string) $row['email'] : null,
            (string) $row['message'],
            isset($row['reply']) ? (string) $row['reply'] : null,
            isset($row['replied_at']) ? new DateTimeImmutable((string) $row['replied_at']) : null,
            filter_var($row['reply_read'], FILTER_VALIDATE_BOOL),
            new DateTimeImmutable((string) $row['created_at']),
        );
    }
}
