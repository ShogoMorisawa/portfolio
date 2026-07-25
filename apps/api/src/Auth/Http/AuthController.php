<?php

declare(strict_types=1);

namespace App\Auth\Http;

use App\Auth\Application\AuthResult;
use App\Auth\Application\AuthService;
use App\Shared\Application\ApiException;
use App\Shared\Application\TurnstileVerifier;
use App\Shared\Application\ValidationException;
use App\Shared\Http\Cookie;
use App\Shared\Http\JsonResponse;
use App\Shared\Http\RequestData;
use App\Shared\Infrastructure\Config;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final readonly class AuthController
{
    public function __construct(
        private AuthService $auth,
        private TurnstileVerifier $turnstile,
        private JsonResponse $json,
        private Config $config,
        private AuthCookieNames $cookies,
    ) {}

    public function login(ServerRequestInterface $request): ResponseInterface
    {
        $body = RequestData::json($request);
        if (trim((string) ($body['website'] ?? '')) !== '') {
            throw new ApiException('INVALID_CREDENTIALS', 'ユーザー名またはパスワードが正しくありません', 401);
        }

        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        if ($username === '' || $password === '') {
            throw new ValidationException(['credentials' => ['ユーザー名とパスワードは必須です']]);
        }

        if (!$this->turnstile->verify(
            (string) ($body['turnstileToken'] ?? ''),
            'admin_login',
            RequestData::clientIp($request),
        )) {
            throw new ApiException('BOT_CHALLENGE_FAILED', '認証を完了できませんでした', 400);
        }
        $result = $this->auth->login($username, $password, RequestData::requestId($request));

        return $this->withSessionCookies(
            $this->json->success([
                'user' => ['id' => $result->userId, 'username' => $result->username],
                'csrfToken' => $result->csrfToken,
            ]),
            $result,
        );
    }

    public function refresh(ServerRequestInterface $request): ResponseInterface
    {
        $refreshToken = (string) ($request->getCookieParams()[$this->cookies->refresh] ?? '');

        try {
            $result = $this->auth->refresh($refreshToken, RequestData::requestId($request));
        } catch (ApiException $exception) {
            return $this->clearSessionCookies($this->json->error(
                $exception->errorCode,
                $exception->getMessage(),
                $exception->status,
                RequestData::requestId($request),
                $exception->fields,
            ));
        }

        return $this->withSessionCookies(
            $this->json->success([
                'user' => ['id' => $result->userId, 'username' => $result->username],
                'csrfToken' => $result->csrfToken,
            ]),
            $result,
        );
    }

    public function logout(ServerRequestInterface $request): ResponseInterface
    {
        $this->auth->logout(
            (string) ($request->getCookieParams()[$this->cookies->refresh] ?? ''),
            (int) $request->getAttribute('auth_sub'),
            RequestData::requestId($request),
        );

        return $this->clearSessionCookies($this->json->success(null, 204));
    }

    public function session(ServerRequestInterface $request): ResponseInterface
    {
        return $this->json->success([
            'user' => [
                'id' => (int) $request->getAttribute('auth_sub'),
                'username' => (string) $request->getAttribute('auth_username'),
            ],
            'csrfToken' => (string) $request->getAttribute('auth_csrf_token'),
        ]);
    }

    private function withSessionCookies(ResponseInterface $response, AuthResult $result): ResponseInterface
    {
        return $response
            ->withAddedHeader('Set-Cookie', Cookie::build(
                $this->cookies->access,
                $result->accessToken,
                $result->accessMaxAge,
                $this->config->secureCookies,
            ))
            ->withAddedHeader('Set-Cookie', Cookie::build(
                $this->cookies->refresh,
                $result->refreshToken,
                $result->refreshMaxAge,
                $this->config->secureCookies,
            ));
    }

    private function clearSessionCookies(ResponseInterface $response): ResponseInterface
    {
        return $response
            ->withAddedHeader('Set-Cookie', Cookie::clear($this->cookies->access, $this->config->secureCookies))
            ->withAddedHeader('Set-Cookie', Cookie::clear($this->cookies->refresh, $this->config->secureCookies));
    }
}
