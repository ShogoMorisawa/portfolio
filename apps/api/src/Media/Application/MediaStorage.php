<?php

declare(strict_types=1);

namespace App\Media\Application;

interface MediaStorage
{
    public function put(string $key, string $contents, string $contentType): string;
}
