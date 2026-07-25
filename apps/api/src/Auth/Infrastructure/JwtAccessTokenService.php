<?php

declare(strict_types=1);

namespace App\Auth\Infrastructure;

use App\Auth\Application\AccessTokenService;
use App\Shared\Application\ApiException;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;

final readonly class JwtAccessTokenService implements AccessTokenService
{
    private const ISSUER = 'portfolio-api';
    private const AUDIENCE = 'portfolio-admin';
    private const MAX_AGE = 900;

    public function __construct(private string $signingKey) {}

    public function issue(int $userId, string $username, string $familyId): array
    {
        $now = time();
        $csrfToken = self::opaqueToken();
        $jti = self::opaqueToken();
        $token = JWT::encode([
            'iss' => self::ISSUER,
            'aud' => self::AUDIENCE,
            'sub' => (string) $userId,
            'username' => $username,
            'sid' => $familyId,
            'csrf' => $csrfToken,
            'jti' => $jti,
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + self::MAX_AGE,
        ], $this->signingKey, 'HS256');

        return ['token' => $token, 'csrf_token' => $csrfToken];
    }

    public function verify(string $token): array
    {
        try {
            JWT::$leeway = 30;
            $claims = (array) JWT::decode($token, new Key($this->signingKey, 'HS256'));
        } catch (ExpiredException) {
            throw new ApiException('ACCESS_TOKEN_EXPIRED', 'アクセストークンの有効期限が切れています', 401);
        } catch (Throwable) {
            throw new ApiException('ACCESS_TOKEN_INVALID', 'ログインし直してください', 401);
        }

        if (
            ($claims['iss'] ?? null) !== self::ISSUER
            || ($claims['aud'] ?? null) !== self::AUDIENCE
            || !ctype_digit((string) ($claims['sub'] ?? ''))
            || !is_string($claims['username'] ?? null)
            || !is_string($claims['sid'] ?? null)
            || !is_string($claims['csrf'] ?? null)
            || !is_string($claims['jti'] ?? null)
            || !is_int($claims['iat'] ?? null)
            || $claims['iat'] > time() + 30
        ) {
            throw new ApiException('ACCESS_TOKEN_INVALID', 'ログインし直してください', 401);
        }

        return [
            'sub' => (int) $claims['sub'],
            'username' => $claims['username'],
            'sid' => $claims['sid'],
            'csrf_token' => $claims['csrf'],
            'jti' => $claims['jti'],
        ];
    }

    private static function opaqueToken(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }
}
