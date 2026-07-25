<?php

declare(strict_types=1);

namespace App\Shared\Http;

final class Cookie
{
    public static function build(
        string $name,
        string $value,
        int $maxAge,
        bool $secure,
        bool $httpOnly = true,
    ): string {
        $parts = [
            rawurlencode($name) . '=' . rawurlencode($value),
            'Path=/',
            'Max-Age=' . max(0, $maxAge),
            'Expires=' . gmdate(DATE_RFC7231, time() + max(0, $maxAge)),
            'SameSite=Strict',
        ];
        if ($secure) {
            $parts[] = 'Secure';
        }
        if ($httpOnly) {
            $parts[] = 'HttpOnly';
        }

        return implode('; ', $parts);
    }

    public static function clear(string $name, bool $secure): string
    {
        return self::build($name, '', 0, $secure);
    }
}
