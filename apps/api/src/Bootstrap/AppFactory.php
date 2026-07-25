<?php

declare(strict_types=1);

namespace App\Bootstrap;

use App\Shared\Http\ErrorHandler;
use App\Shared\Http\Middleware\AccessLogMiddleware;
use App\Shared\Http\Middleware\CorsMiddleware;
use App\Shared\Http\Middleware\RequestIdMiddleware;
use App\Shared\Http\Middleware\RequestSizeMiddleware;
use App\Shared\Http\Middleware\SecurityHeadersMiddleware;
use App\Shared\Infrastructure\Config;
use Psr\Container\ContainerInterface;
use Slim\App;
use Slim\Factory\AppFactory as SlimAppFactory;

final class AppFactory
{
    /**
     * @return App<ContainerInterface|null>
     */
    public static function create(): App
    {
        $container = ContainerFactory::create();
        SlimAppFactory::setContainer($container);
        $app = SlimAppFactory::create();

        Routes::register($app, $container);
        $app->addRoutingMiddleware();

        $config = $container->get(Config::class);
        $errorMiddleware = $app->addErrorMiddleware($config->debug, true, true);
        $errorMiddleware->setDefaultErrorHandler($container->get(ErrorHandler::class));

        $app->add($container->get(RequestSizeMiddleware::class));
        $app->add($container->get(CorsMiddleware::class));
        $app->add($container->get(SecurityHeadersMiddleware::class));
        $app->add($container->get(AccessLogMiddleware::class));
        $app->add($container->get(RequestIdMiddleware::class));

        return $app;
    }
}
