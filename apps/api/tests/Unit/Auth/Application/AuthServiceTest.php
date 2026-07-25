<?php

declare(strict_types=1);

namespace Tests\Unit\Auth\Application;

use App\Auth\Application\AccessTokenService;
use App\Auth\Application\AuthService;
use App\Auth\Application\SessionRepository;
use App\Auth\Application\UserRepository;
use App\Shared\Application\ApiException;
use App\Shared\Application\AuditLogger;
use App\Shared\Application\TransactionManager;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class AuthServiceTest extends TestCase
{
    #[Test]
    public function itRejectsAReusedRefreshTokenAfterCommittingFamilyRevocation(): void
    {
        $sessions = $this->createMock(SessionRepository::class);
        $sessions
            ->expects(self::once())
            ->method('rotate')
            ->willReturn(['error' => 'reuse']);

        $transaction = $this->createMock(TransactionManager::class);
        $transaction
            ->expects(self::once())
            ->method('run')
            ->willReturnCallback(static fn(callable $operation): mixed => $operation());

        $audit = $this->createMock(AuditLogger::class);
        $audit
            ->expects(self::once())
            ->method('record')
            ->with('auth.refresh_reuse_detected', null, null, null, 'request-id');

        $service = new AuthService(
            $this->createStub(UserRepository::class),
            $sessions,
            $this->createStub(AccessTokenService::class),
            $transaction,
            $audit,
        );

        try {
            $service->refresh('already-used-refresh-token', 'request-id');
            self::fail('A reused refresh token must be rejected.');
        } catch (ApiException $exception) {
            self::assertSame('SESSION_REUSE_DETECTED', $exception->errorCode);
            self::assertSame(401, $exception->status);
        }
    }
}
