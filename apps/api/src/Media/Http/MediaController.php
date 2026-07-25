<?php

declare(strict_types=1);

namespace App\Media\Http;

use App\Media\Application\MediaService;
use App\Shared\Application\ValidationException;
use App\Shared\Http\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;

final readonly class MediaController
{
    public function __construct(
        private MediaService $media,
        private JsonResponse $json,
    ) {}

    public function upload(ServerRequestInterface $request): ResponseInterface
    {
        $file = $request->getUploadedFiles()['image'] ?? null;
        if (!$file instanceof UploadedFileInterface || $file->getError() !== UPLOAD_ERR_OK) {
            throw new ValidationException(['image' => ['画像を指定してください']]);
        }
        if (($file->getSize() ?? 0) > 3_145_728) {
            throw new ValidationException(['image' => ['画像は3MB以内で指定してください']]);
        }

        $contents = (string) $file->getStream();

        return $this->json->success(['url' => $this->media->upload($contents)], 201);
    }
}
