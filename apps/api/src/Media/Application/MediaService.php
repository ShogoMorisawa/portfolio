<?php

declare(strict_types=1);

namespace App\Media\Application;

use App\Shared\Application\ValidationException;
use finfo;

final readonly class MediaService
{
    private const MAX_BYTES = 3_145_728;
    private const TYPES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public function __construct(private MediaStorage $storage) {}

    public function upload(string $contents): string
    {
        $size = strlen($contents);
        if ($size < 1 || $size > self::MAX_BYTES) {
            throw new ValidationException(['image' => ['画像は3MB以内で指定してください']]);
        }

        $mimeType = (new finfo(FILEINFO_MIME_TYPE))->buffer($contents);
        $imageInfo = @getimagesizefromstring($contents);
        if (!is_string($mimeType) || !isset(self::TYPES[$mimeType]) || $imageInfo === false) {
            throw new ValidationException(['image' => ['JPEG、PNG、WebP画像を指定してください']]);
        }
        if ($imageInfo['mime'] !== $mimeType) {
            throw new ValidationException(['image' => ['画像データの形式が一致しません']]);
        }

        $key = sprintf(
            'images/%s/%s.%s',
            gmdate('Y/m'),
            bin2hex(random_bytes(20)),
            self::TYPES[$mimeType],
        );

        return $this->storage->put($key, $contents, $mimeType);
    }
}
