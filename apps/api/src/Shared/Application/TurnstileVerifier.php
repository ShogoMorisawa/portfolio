<?php

declare(strict_types=1);

namespace App\Shared\Application;

interface TurnstileVerifier
{
    public function verify(string $token, string $action, ?string $remoteIp): bool;
}
