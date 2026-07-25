<?php

declare(strict_types=1);

namespace App\Letter\Application;

use App\Letter\Model\Letter;

interface LetterNotifier
{
    public function notify(Letter $letter, string $requestId): void;
}
