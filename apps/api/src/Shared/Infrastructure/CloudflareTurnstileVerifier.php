<?php

declare(strict_types=1);

namespace App\Shared\Infrastructure;

use App\Shared\Application\TurnstileVerifier;
use GuzzleHttp\ClientInterface;
use Throwable;

final readonly class CloudflareTurnstileVerifier implements TurnstileVerifier
{
    public function __construct(
        private ClientInterface $client,
        private Config $config,
    ) {}

    public function verify(string $token, string $action, ?string $remoteIp): bool
    {
        if ($this->config->turnstileSecret === '') {
            return $this->config->environment !== 'production';
        }

        if ($token === '' || strlen($token) > 2048) {
            return false;
        }

        try {
            $response = $this->client->request('POST', 'https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'timeout' => 5,
                'form_params' => [
                    'secret' => $this->config->turnstileSecret,
                    'response' => $token,
                    'remoteip' => $remoteIp,
                    'idempotency_key' => self::uuid(),
                ],
            ]);
            /** @var array{success?: bool, action?: string, hostname?: string} $result */
            $result = json_decode((string) $response->getBody(), true, 16, JSON_THROW_ON_ERROR);

            $hostnames = array_map('trim', explode(',', $this->config->turnstileHostname));

            return ($result['success'] ?? false)
                && hash_equals($action, (string) ($result['action'] ?? ''))
                && in_array((string) ($result['hostname'] ?? ''), $hostnames, true);
        } catch (Throwable) {
            return false;
        }
    }

    private static function uuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);

        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
