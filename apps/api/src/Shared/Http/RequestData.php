<?php

declare(strict_types=1);

namespace App\Shared\Http;

use App\Shared\Application\ApiException;
use JsonException;
use Psr\Http\Message\ServerRequestInterface;

final class RequestData
{
    /**
     * @return array<string, mixed>
     */
    public static function json(ServerRequestInterface $request): array
    {
        $contentType = strtolower($request->getHeaderLine('Content-Type'));
        if (!str_starts_with($contentType, 'application/json')) {
            throw new ApiException('UNSUPPORTED_MEDIA_TYPE', 'Content-Typeはapplication/jsonを指定してください', 415);
        }

        try {
            $data = json_decode((string) $request->getBody(), true, 64, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new ApiException('INVALID_JSON', 'JSONの形式が正しくありません', 400);
        }

        if (!is_array($data) || array_is_list($data)) {
            throw new ApiException('INVALID_JSON', 'JSONオブジェクトを指定してください', 400);
        }

        return $data;
    }

    public static function requestId(ServerRequestInterface $request): string
    {
        return (string) $request->getAttribute('request_id', 'unknown');
    }

    public static function clientIp(ServerRequestInterface $request): ?string
    {
        $forwarded = $request->getHeaderLine('X-Forwarded-For');
        if ($forwarded !== '') {
            return trim(explode(',', $forwarded)[0]);
        }

        $server = $request->getServerParams();

        return isset($server['REMOTE_ADDR']) ? (string) $server['REMOTE_ADDR'] : null;
    }
}
