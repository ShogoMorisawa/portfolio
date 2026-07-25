<?php

declare(strict_types=1);

namespace App\Letter\Infrastructure;

use App\Letter\Application\LetterNotifier;
use App\Letter\Model\Letter;
use Aws\Ses\SesClient;
use Monolog\Logger;
use Throwable;

final readonly class SesLetterNotifier implements LetterNotifier
{
    public function __construct(
        private SesClient $ses,
        private Logger $logger,
        private string $recipient,
        private bool $enabled,
    ) {}

    public function notify(Letter $letter, string $requestId): void
    {
        if (!$this->enabled || $this->recipient === '') {
            $this->logger->warning('letter_notification_skipped', ['request_id' => $requestId]);

            return;
        }

        try {
            $this->ses->sendEmail([
                'Source' => 'noreply@shogomorisawa.me',
                'Destination' => ['ToAddresses' => [$this->recipient]],
                'Message' => [
                    'Subject' => [
                        'Data' => sprintf('ポストに手紙が届きました（%sさん）', $letter->name),
                        'Charset' => 'UTF-8',
                    ],
                    'Body' => [
                        'Text' => [
                            'Data' => sprintf(
                                "差出人: %s\n返信先: %s\n\n%s",
                                $letter->name,
                                $letter->email ?? '未記入',
                                $letter->message,
                            ),
                            'Charset' => 'UTF-8',
                        ],
                    ],
                ],
            ]);
        } catch (Throwable $exception) {
            $this->logger->error('letter_notification_failed', [
                'request_id' => $requestId,
                'letter_id' => $letter->id,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
