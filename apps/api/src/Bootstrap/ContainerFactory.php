<?php

declare(strict_types=1);

namespace App\Bootstrap;

use App\Article\Application\ArticleRepository;
use App\Article\Infrastructure\PdoArticleRepository;
use App\Auth\Application\AccessTokenService;
use App\Auth\Application\SessionRepository;
use App\Auth\Application\UserRepository;
use App\Auth\Http\AuthCookieNames;
use App\Auth\Infrastructure\JwtAccessTokenService;
use App\Auth\Infrastructure\PdoSessionRepository;
use App\Auth\Infrastructure\PdoUserRepository;
use App\Letter\Application\LetterboxRepository;
use App\Letter\Application\LetterNotifier;
use App\Letter\Application\LetterRepository;
use App\Letter\Infrastructure\PdoLetterboxRepository;
use App\Letter\Infrastructure\PdoLetterRepository;
use App\Letter\Infrastructure\SesLetterNotifier;
use App\Media\Application\MediaStorage;
use App\Media\Infrastructure\S3MediaStorage;
use App\Shared\Application\AuditLogger;
use App\Shared\Application\TransactionManager;
use App\Shared\Application\TurnstileVerifier;
use App\Shared\Infrastructure\CloudflareTurnstileVerifier;
use App\Shared\Infrastructure\Config;
use App\Shared\Infrastructure\Database;
use App\Shared\Infrastructure\PdoAuditLogger;
use App\Shared\Infrastructure\PdoTransactionManager;
use Aws\S3\S3Client;
use Aws\Ses\SesClient;

use function DI\autowire;

use DI\Container;
use DI\ContainerBuilder;

use function DI\factory;

use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use Monolog\Formatter\JsonFormatter;
use Monolog\Handler\StreamHandler;
use Monolog\Level;
use Monolog\Logger;
use PDO;
use Psr\Http\Message\ResponseFactoryInterface;
use Slim\Psr7\Factory\ResponseFactory;

final class ContainerFactory
{
    public static function create(): Container
    {
        $builder = new ContainerBuilder();
        $builder->useAutowiring(true);
        $builder->addDefinitions([
            Config::class => factory(static fn(): Config => Config::fromEnvironment()),
            PDO::class => factory(static fn(Database $database): PDO => $database->connection()),
            ResponseFactoryInterface::class => autowire(ResponseFactory::class),
            Logger::class => factory(static function (): Logger {
                $logger = new Logger('portfolio-api');
                $handler = new StreamHandler('php://stderr', Level::Info);
                $handler->setFormatter(new JsonFormatter());
                $logger->pushHandler($handler);

                return $logger;
            }),
            ClientInterface::class => factory(static fn(): ClientInterface => new Client()),
            S3Client::class => factory(static fn(Config $config): S3Client => new S3Client([
                'version' => 'latest',
                'region' => $config->awsRegion,
            ])),
            SesClient::class => factory(static fn(Config $config): SesClient => new SesClient([
                'version' => 'latest',
                'region' => $config->awsRegion,
            ])),
            AuthCookieNames::class => factory(
                static fn(Config $config): AuthCookieNames => AuthCookieNames::forEnvironment($config->secureCookies),
            ),
            AccessTokenService::class => factory(
                static fn(Config $config): AccessTokenService => new JwtAccessTokenService($config->jwtSigningKey),
            ),
            UserRepository::class => autowire(PdoUserRepository::class),
            SessionRepository::class => autowire(PdoSessionRepository::class),
            TransactionManager::class => autowire(PdoTransactionManager::class),
            AuditLogger::class => autowire(PdoAuditLogger::class),
            TurnstileVerifier::class => autowire(CloudflareTurnstileVerifier::class),
            ArticleRepository::class => autowire(PdoArticleRepository::class),
            LetterboxRepository::class => autowire(PdoLetterboxRepository::class),
            LetterRepository::class => autowire(PdoLetterRepository::class),
            LetterNotifier::class => factory(
                static fn(SesClient $ses, Logger $logger, Config $config): LetterNotifier => new SesLetterNotifier(
                    $ses,
                    $logger,
                    $config->notificationEmail,
                    $config->environment === 'production',
                ),
            ),
            MediaStorage::class => factory(
                static fn(S3Client $s3, Config $config): MediaStorage => new S3MediaStorage(
                    $s3,
                    $config->bucketName,
                    $config->mediaBaseUrl,
                ),
            ),
        ]);

        return $builder->build();
    }
}
