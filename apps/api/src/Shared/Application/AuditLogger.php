<?php

declare(strict_types=1);

namespace App\Shared\Application;

interface AuditLogger
{
    /**
     * @param array<string, scalar|null> $metadata
     */
    public function record(
        string $action,
        ?int $actorUserId = null,
        ?string $subjectType = null,
        ?string $subjectId = null,
        ?string $requestId = null,
        array $metadata = [],
    ): void;
}
