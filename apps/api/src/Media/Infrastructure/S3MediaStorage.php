<?php

declare(strict_types=1);

namespace App\Media\Infrastructure;

use App\Media\Application\MediaStorage;
use Aws\S3\S3Client;
use RuntimeException;

final readonly class S3MediaStorage implements MediaStorage
{
    public function __construct(
        private S3Client $s3,
        private string $bucket,
        private string $baseUrl,
    ) {}

    public function put(string $key, string $contents, string $contentType): string
    {
        if ($this->bucket === '') {
            throw new RuntimeException('AWS_BUCKET_NAME is not configured.');
        }

        $this->s3->putObject([
            'Bucket' => $this->bucket,
            'Key' => $key,
            'Body' => $contents,
            'ContentType' => $contentType,
            'CacheControl' => 'public, max-age=31536000, immutable',
        ]);

        if ($this->baseUrl !== '') {
            return $this->baseUrl . '/' . $key;
        }

        return sprintf('https://%s.s3.amazonaws.com/%s', $this->bucket, $key);
    }
}
