<?php

declare(strict_types=1);

namespace App\Shared\Application;

final class ValidationException extends ApiException
{
    /**
     * @param array<string, list<string>> $fields
     */
    public function __construct(array $fields, string $message = '入力内容を確認してください')
    {
        parent::__construct('VALIDATION_ERROR', $message, 422, $fields);
    }
}
