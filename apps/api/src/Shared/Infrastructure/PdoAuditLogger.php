<?php

declare(strict_types=1);

namespace App\Shared\Infrastructure;

use App\Shared\Application\AuditLogger;
use JsonException;
use Monolog\Logger;

final readonly class PdoAuditLogger implements AuditLogger
{
    public function __construct(
        private Database $database,
        private Logger $logger,
    ) {}

    /**
     * @throws JsonException
     */
    public function record(
        string $action,
        ?int $actorUserId = null,
        ?string $subjectType = null,
        ?string $subjectId = null,
        ?string $requestId = null,
        array $metadata = [],
    ): void {
        $statement = $this->database->connection()->prepare(
            <<<'SQL'
INSERT INTO audit_logs (actor_user_id, action, subject_type, subject_id, request_id, metadata)
VALUES (:actor_user_id, :action, :subject_type, :subject_id, :request_id, CAST(:metadata AS jsonb))
SQL,
        );
        $statement->execute([
            'actor_user_id' => $actorUserId,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'request_id' => $requestId,
            'metadata' => json_encode($metadata, JSON_THROW_ON_ERROR),
        ]);

        $this->logger->info('audit_event', [
            'action' => $action,
            'actor_user_id' => $actorUserId,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'request_id' => $requestId,
        ]);
    }
}
