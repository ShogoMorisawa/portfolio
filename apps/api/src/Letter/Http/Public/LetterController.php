<?php

declare(strict_types=1);

namespace App\Letter\Http\Public;

use App\Letter\Application\LetterService;
use App\Letter\Http\LetterboxCookie;
use App\Shared\Application\TurnstileVerifier;
use App\Shared\Http\Cookie;
use App\Shared\Http\JsonResponse;
use App\Shared\Http\RequestData;
use App\Shared\Infrastructure\Config;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final readonly class LetterController
{
    public function __construct(
        private LetterService $letters,
        private TurnstileVerifier $turnstile,
        private JsonResponse $json,
        private Config $config,
    ) {}

    public function submit(ServerRequestInterface $request): ResponseInterface
    {
        $body = RequestData::json($request);
        if (trim((string) ($body['website'] ?? '')) !== '') {
            return $this->json->success(null, 202);
        }

        if (!$this->turnstile->verify(
            (string) ($body['turnstileToken'] ?? ''),
            'letter_submit',
            RequestData::clientIp($request),
        )) {
            throw new \App\Shared\Application\ApiException(
                'BOT_CHALLENGE_FAILED',
                '認証を完了できませんでした',
                400,
            );
        }
        $cookieName = LetterboxCookie::name($this->config->secureCookies);
        $submission = $this->letters->submit(
            $body,
            (string) ($request->getCookieParams()[$cookieName] ?? ''),
            RequestData::requestId($request),
        );
        $response = $this->json->success(['id' => $submission->letter->id], 201);

        if ($submission->newLetterboxToken !== null) {
            $response = $response->withAddedHeader('Set-Cookie', Cookie::build(
                $cookieName,
                $submission->newLetterboxToken,
                $submission->letterboxMaxAge,
                $this->config->secureCookies,
            ));
        }

        return $response;
    }

    public function replies(ServerRequestInterface $request): ResponseInterface
    {
        $token = (string) ($request->getCookieParams()[LetterboxCookie::name($this->config->secureCookies)] ?? '');

        return $this->json->success(array_map(
            static fn($letter): array => $letter->toPublicReplyArray(),
            $this->letters->unreadReplies($token),
        ));
    }

    public function readReceipts(ServerRequestInterface $request): ResponseInterface
    {
        $body = RequestData::json($request);
        $token = (string) ($request->getCookieParams()[LetterboxCookie::name($this->config->secureCookies)] ?? '');

        return $this->json->success([
            'updated' => $this->letters->markRead($token, $body['letterIds'] ?? null),
        ]);
    }
}
