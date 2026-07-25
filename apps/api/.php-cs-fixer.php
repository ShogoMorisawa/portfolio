<?php

declare(strict_types=1);

use PhpCsFixer\Config;
use PhpCsFixer\Finder;

$finder = Finder::create()
    ->in([
        __DIR__ . '/src/Article',
        __DIR__ . '/src/Auth',
        __DIR__ . '/src/Bootstrap',
        __DIR__ . '/src/Letter',
        __DIR__ . '/src/Media',
        __DIR__ . '/src/Shared',
        __DIR__ . '/tests',
        __DIR__ . '/migrations',
    ])
    ->append([__FILE__, __DIR__ . '/public/index.php']);

return (new Config())
    ->setRiskyAllowed(true)
    ->setRules([
        '@PER-CS2.0' => true,
        'declare_strict_types' => true,
        'ordered_imports' => true,
        'no_unused_imports' => true,
        'strict_comparison' => true,
    ])
    ->setFinder($finder);
