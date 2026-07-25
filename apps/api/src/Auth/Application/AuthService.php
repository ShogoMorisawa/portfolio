<?php

declare(strict_types=1);

namespace App\Auth\Application;

use App\Shared\Application\ApiException;
use App\Shared\Application\AuditLogger;
use App\Shared\Application\TransactionManager;
use DateTimeImmutable;

final readonly class AuthService
{
    private const ACCESS_MAX_AGE = 900;
    private const REFRESH_MAX_AGE = 1_209_600;

    public function __construct(
        private UserRepository $users,
        private SessionRepository $sessions,
        private AccessTokenService $accessTokens,
        private TransactionManager $transaction,
        private AuditLogger $audit,
    ) {}

    public function login(string $username, string $password, string $requestId): AuthResult
    {
        $user = $this->users->findByUsername($username);
        if ($user === null || !password_verify($password, $user->passwordHash)) {
            $this->audit->record('auth.login_failed', requestId: $requestId);
            throw new ApiException('INVALID_CREDENTIALS', 'ユーザー名またはパスワードが正しくありません', 401);
        }
        if (password_needs_rehash($user->passwordHash, PASSWORD_ARGON2ID)) {
            $this->users->updatePasswordHash($user->id, password_hash($password, PASSWORD_ARGON2ID));
        }

        $familyId = self::uuid();
        $refreshToken = self::opaqueToken();
        $now = new DateTimeImmutable();
        $expiresAt = $now->modify('+' . self::REFRESH_MAX_AGE . ' seconds');
        $this->sessions->create($familyId, $user->id, hash('sha256', $refreshToken), $expiresAt);
        $issued = $this->accessTokens->issue($user->id, $user->username, $familyId);
        $this->audit->record('auth.login_succeeded', $user->id, requestId: $requestId);

        return new AuthResult(
            $user->id,
            $user->username,
            $issued['token'],
            $refreshToken,
            $issued['csrf_token'],
            self::ACCESS_MAX_AGE,
            self::REFRESH_MAX_AGE,
        );
    }

    public function refresh(string $refreshToken, string $requestId): AuthResult
    {
        if ($refreshToken === '') {
            throw new ApiException('REFRESH_REQUIRED', 'ログインし直してください', 401);
        }

        $newToken = self::opaqueToken();
        $now = new DateTimeImmutable();
        $session = $this->transaction->run(
            fn(): array => $this->sessions->rotate(hash('sha256', $refreshToken), hash('sha256', $newToken), $now),
        );
        if (isset($session['error'])) {
            if ($session['error'] === 'reuse') {
                $this->audit->record('auth.refresh_reuse_detected', requestId: $requestId);
                throw new ApiException('SESSION_REUSE_DETECTED', '安全のためログイン状態を解除しました', 401);
            }

            throw new ApiException('SESSION_EXPIRED', 'ログインし直してください', 401);
        }
        $user = $this->users->findById($session['user_id']);
        if ($user === null) {
            throw new ApiException('SESSION_INVALID', 'ログインし直してください', 401);
        }

        $issued = $this->accessTokens->issue($user->id, $user->username, $session['family_id']);
        $remaining = max(0, $session['expires_at']->getTimestamp() - $now->getTimestamp());

        return new AuthResult(
            $user->id,
            $user->username,
            $issued['token'],
            $newToken,
            $issued['csrf_token'],
            self::ACCESS_MAX_AGE,
            $remaining,
        );
    }

    public function logout(string $refreshToken, int $userId, string $requestId): void
    {
        if ($refreshToken !== '') {
            $this->sessions->revokeByTokenHash(hash('sha256', $refreshToken), new DateTimeImmutable());
        }
        $this->audit->record('auth.logout', $userId, requestId: $requestId);
    }

    private static function opaqueToken(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }

    private static function uuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);

        return sprintf(
            '%s-%s-%s-%s-%s',
            substr($hex, 0, 8),
            substr($hex, 8, 4),
            substr($hex, 12, 4),
            substr($hex, 16, 4),
            substr($hex, 20),
        );
    }
}
