<?php

declare(strict_types=1);

namespace App\Letter\Application;

use App\Letter\Model\Letter;

final readonly class LetterSubmission
{
    public function __construct(
        public Letter $letter,
        public ?string $newLetterboxToken,
        public int $letterboxMaxAge,
    ) {}
}
