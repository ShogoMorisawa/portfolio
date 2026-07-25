<?php

declare(strict_types=1);

namespace App\Shared\Infrastructure;

use App\Shared\Application\TransactionManager;
use Throwable;

final readonly class PdoTransactionManager implements TransactionManager
{
    public function __construct(private Database $database) {}

    public function run(callable $operation): mixed
    {
        $pdo = $this->database->connection();
        $pdo->beginTransaction();

        try {
            $result = $operation();
            $pdo->commit();

            return $result;
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            throw $error;
        }
    }
}
