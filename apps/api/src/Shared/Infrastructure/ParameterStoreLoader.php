<?php

declare(strict_types=1);

namespace App\Shared\Infrastructure;

use Aws\Ssm\SsmClient;

final class ParameterStoreLoader
{
    /** @var array<string, string> */
    private const ENVIRONMENT_KEYS = [
        'database-url' => 'DATABASE_URL',
        'jwt-signing-key' => 'JWT_SIGNING_KEY',
        'turnstile-secret' => 'TURNSTILE_SECRET_KEY',
        'notification-email' => 'NOTIFICATION_EMAIL',
    ];

    public static function load(): void
    {
        $prefix = rtrim((string) getenv('SSM_PARAMETER_PREFIX'), '/');
        if ($prefix === '' || getenv('APP_ENV') !== 'production') {
            return;
        }

        $client = new SsmClient([
            'version' => 'latest',
            'region' => getenv('AWS_REGION') ?: 'ap-northeast-1',
        ]);

        $names = array_map(
            static fn(string $name): string => "{$prefix}/{$name}",
            array_keys(self::ENVIRONMENT_KEYS),
        );

        $result = $client->getParameters([
            'Names' => $names,
            'WithDecryption' => true,
        ]);

        foreach ($result['Parameters'] ?? [] as $parameter) {
            $shortName = basename((string) $parameter['Name']);
            $environmentKey = self::ENVIRONMENT_KEYS[$shortName] ?? null;
            if ($environmentKey !== null) {
                putenv("{$environmentKey}={$parameter['Value']}");
            }
        }

        $missing = array_filter(
            self::ENVIRONMENT_KEYS,
            static fn(string $environmentKey): bool => getenv($environmentKey) === false,
        );
        if ($missing !== []) {
            throw new \RuntimeException('Missing SSM parameters: ' . implode(', ', array_keys($missing)));
        }
    }
}
