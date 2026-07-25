<?php

declare(strict_types=1);

namespace App\Shared\Infrastructure;

use RuntimeException;

final readonly class Config
{
    /**
     * @param list<string> $allowedOrigins
     */
    public function __construct(
        public string $environment,
        public bool $debug,
        public string $databaseDsn,
        public string $databaseUser,
        public string $databasePassword,
        public string $jwtSigningKey,
        public array $allowedOrigins,
        public string $awsRegion,
        public string $bucketName,
        public string $mediaBaseUrl,
        public string $notificationEmail,
        public string $turnstileSecret,
        public string $turnstileHostname,
        public bool $secureCookies,
    ) {}

    public static function fromEnvironment(): self
    {
        $environment = self::env('APP_ENV', 'local');
        $databaseUrl = self::env('DATABASE_URL');

        if ($databaseUrl !== '') {
            [$dsn, $user, $password] = self::parseDatabaseUrl($databaseUrl);
        } else {
            $host = self::env('DB_HOST', 'db');
            $name = self::env('DB_NAME', 'blog_db');
            $user = self::env('DB_USER', 'blog_user');
            $password = self::env('DB_PASS', 'blog_pass');
            $sslMode = $environment === 'production' ? 'require' : 'prefer';
            $dsn = "pgsql:host={$host};port=5432;dbname={$name};sslmode={$sslMode}";
        }

        $jwtSigningKey = self::env('JWT_SIGNING_KEY', self::env('JWT_SECRET'));
        if (strlen($jwtSigningKey) < 32) {
            throw new RuntimeException('JWT_SIGNING_KEY must be at least 32 characters.');
        }

        $origins = array_values(array_filter(array_map(
            static fn(string $origin): string => rtrim(trim($origin), '/'),
            explode(',', self::env('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001')),
        )));
        $bucketName = self::env('AWS_BUCKET_NAME');
        $notificationEmail = self::env('NOTIFICATION_EMAIL', self::env('MY_EMAIL'));
        $turnstileSecret = self::env('TURNSTILE_SECRET_KEY');
        if ($environment === 'production') {
            $missing = [];
            foreach ([
                'DATABASE_URL' => $databaseUrl,
                'AWS_BUCKET_NAME' => $bucketName,
                'NOTIFICATION_EMAIL' => $notificationEmail,
                'TURNSTILE_SECRET_KEY' => $turnstileSecret,
            ] as $name => $value) {
                if ($value === '') {
                    $missing[] = $name;
                }
            }
            if ($missing !== []) {
                throw new RuntimeException('Missing production configuration: ' . implode(', ', $missing));
            }
        }

        return new self(
            environment: $environment,
            debug: filter_var(self::env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOL),
            databaseDsn: $dsn,
            databaseUser: $user,
            databasePassword: $password,
            jwtSigningKey: $jwtSigningKey,
            allowedOrigins: $origins,
            awsRegion: self::env('AWS_REGION', 'ap-northeast-1'),
            bucketName: $bucketName,
            mediaBaseUrl: rtrim(self::env('MEDIA_BASE_URL'), '/'),
            notificationEmail: $notificationEmail,
            turnstileSecret: $turnstileSecret,
            turnstileHostname: self::env('TURNSTILE_EXPECTED_HOSTNAME', 'localhost'),
            secureCookies: $environment === 'production',
        );
    }

    private static function env(string $name, string $default = ''): string
    {
        $value = getenv($name);

        return $value === false ? $default : trim($value);
    }

    /**
     * @return array{string, string, string}
     */
    private static function parseDatabaseUrl(string $url): array
    {
        $parts = parse_url($url);
        if ($parts === false || !isset($parts['host'], $parts['path'], $parts['user'])) {
            throw new RuntimeException('DATABASE_URL is invalid.');
        }

        $host = $parts['host'];
        $port = (int) ($parts['port'] ?? 5432);
        $database = ltrim($parts['path'], '/');
        $user = rawurldecode($parts['user']);
        $password = rawurldecode($parts['pass'] ?? '');
        parse_str($parts['query'] ?? '', $query);
        $sslMode = is_string($query['sslmode'] ?? null) ? $query['sslmode'] : 'require';

        return ["pgsql:host={$host};port={$port};dbname={$database};sslmode={$sslMode}", $user, $password];
    }
}
