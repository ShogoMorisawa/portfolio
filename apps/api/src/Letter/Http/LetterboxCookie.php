<?php

declare(strict_types=1);

namespace App\Letter\Http;

final class LetterboxCookie
{
    public static function name(bool $secure): string
    {
        return $secure ? '__Host-letterbox' : 'letterbox';
    }
}
