<?php

declare(strict_types=1);

namespace Tests\Unit\Media\Application;

use App\Media\Application\MediaService;
use App\Media\Application\MediaStorage;
use App\Shared\Application\ValidationException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class MediaServiceTest extends TestCase
{
    #[Test]
    public function itRejectsNonImageBytes(): void
    {
        $storage = new class implements MediaStorage {
            public function put(string $key, string $contents, string $contentType): string
            {
                throw new \LogicException('Storage must not be called for invalid input.');
            }
        };

        $this->expectException(ValidationException::class);
        (new MediaService($storage))->upload('not-an-image');
    }
}
