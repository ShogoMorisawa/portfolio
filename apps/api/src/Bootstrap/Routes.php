<?php

declare(strict_types=1);

namespace App\Bootstrap;

use App\Article\Http\Admin\ArticleController as AdminArticleController;
use App\Article\Http\Public\ArticleController as PublicArticleController;
use App\Auth\Http\AuthController;
use App\Auth\Http\Middleware\AdminAuthMiddleware;
use App\Auth\Http\Middleware\CsrfMiddleware;
use App\Letter\Http\Admin\LetterController as AdminLetterController;
use App\Letter\Http\Public\LetterController as PublicLetterController;
use App\Media\Http\MediaController;
use App\Shared\Http\JsonResponse;
use App\Shared\Infrastructure\Database;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Slim\App;
use Slim\Routing\RouteCollectorProxy;

final class Routes
{
    /**
     * @param App<ContainerInterface|null> $app
     */
    public static function register(App $app, ContainerInterface $container): void
    {
        $app->get('/health', function (
            ServerRequestInterface $request,
            ResponseInterface $response,
            array $args,
        ) use ($container): ResponseInterface {
            return $container->get(JsonResponse::class)->success(['status' => 'ok']);
        });
        $app->get('/health/ready', function (
            ServerRequestInterface $request,
            ResponseInterface $response,
            array $args,
        ) use ($container): ResponseInterface {
            $container->get(Database::class)->connection()->query('SELECT 1');

            return $container->get(JsonResponse::class)->success(['status' => 'ready']);
        });

        $app->get('/articles', [PublicArticleController::class, 'index']);
        $app->get('/articles/{slug:[a-z0-9-]+}', [PublicArticleController::class, 'show']);

        $app->post('/auth/login', [AuthController::class, 'login']);
        $app->post('/auth/refresh', [AuthController::class, 'refresh']);
        $app->get('/auth/session', [AuthController::class, 'session'])
            ->add(AdminAuthMiddleware::class);
        $app->post('/auth/logout', [AuthController::class, 'logout'])
            ->add(CsrfMiddleware::class)
            ->add(AdminAuthMiddleware::class);

        $app->post('/letterbox/letters', [PublicLetterController::class, 'submit']);
        $app->get('/letterbox/replies', [PublicLetterController::class, 'replies']);
        $app->post('/letterbox/read-receipts', [PublicLetterController::class, 'readReceipts']);

        $app->group('/admin', function (RouteCollectorProxy $group): void {
            $group->get('/articles', [AdminArticleController::class, 'index']);
            $group->post('/articles', [AdminArticleController::class, 'create'])
                ->add(CsrfMiddleware::class);
            $group->get('/articles/{id:[0-9]+}', [AdminArticleController::class, 'show']);
            $group->put('/articles/{id:[0-9]+}', [AdminArticleController::class, 'update'])
                ->add(CsrfMiddleware::class);
            $group->delete('/articles/{id:[0-9]+}', [AdminArticleController::class, 'delete'])
                ->add(CsrfMiddleware::class);
            $group->post('/media', [MediaController::class, 'upload'])
                ->add(CsrfMiddleware::class);
            $group->get('/letters', [AdminLetterController::class, 'index']);
            $group->put('/letters/{id:[0-9]+}/reply', [AdminLetterController::class, 'reply'])
                ->add(CsrfMiddleware::class);
            $group->delete('/letters/{id:[0-9]+}', [AdminLetterController::class, 'delete'])
                ->add(CsrfMiddleware::class);
        })->add(AdminAuthMiddleware::class);
    }
}
