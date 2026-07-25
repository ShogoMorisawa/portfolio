<?php

declare(strict_types=1);

namespace App\Auth\Http;

final readonly class AuthCookieNames
{
    public function __construct(public string $access, public string $refresh) {}

    public static function forEnvironment(bool $secure): self
    {
        return $secure
            ? new self('__Host-admin_access', '__Host-admin_refresh')
            : new self('admin_access', 'admin_refresh');
    }
}
