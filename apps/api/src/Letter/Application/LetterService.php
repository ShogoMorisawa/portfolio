<?php

declare(strict_types=1);

namespace App\Letter\Application;

use App\Letter\Model\Letter;
use App\Shared\Application\ApiException;
use App\Shared\Application\AuditLogger;
use App\Shared\Application\TransactionManager;
use App\Shared\Application\ValidationException;
use DateTimeImmutable;

final readonly class LetterService
{
    private const LETTERBOX_MAX_AGE = 31_536_000;

    public function __construct(
        private LetterRepository $letters,
        private LetterboxRepository $letterboxes,
        private LetterNotifier $notifier,
        private AuditLogger $audit,
        private TransactionManager $transaction,
    ) {}

    /**
     * @param array<string, mixed> $input
     */
    public function submit(array $input, string $letterboxToken, string $requestId): LetterSubmission
    {
        [$name, $email, $message] = $this->validateLetter($input);
        $now = new DateTimeImmutable();
        $letterboxId = $letterboxToken === ''
            ? null
            : $this->letterboxes->findValidId(hash('sha256', $letterboxToken), $now);
        $newToken = null;

        $result = $this->transaction->run(function () use (
            $letterboxId,
            $now,
            $name,
            $email,
            $message,
        ): array {
            $newToken = null;
            if ($letterboxId === null) {
                $newToken = self::opaqueToken();
                $letterboxId = $this->letterboxes->create(
                    hash('sha256', $newToken),
                    $now->modify('+' . self::LETTERBOX_MAX_AGE . ' seconds'),
                );
            }

            return [
                'letter' => $this->letters->create($letterboxId, $name, $email, $message),
                'new_token' => $newToken,
            ];
        });
        $letter = $result['letter'];
        $newToken = $result['new_token'];
        $this->notifier->notify($letter, $requestId);

        return new LetterSubmission($letter, $newToken, self::LETTERBOX_MAX_AGE);
    }

    /**
     * @return list<Letter>
     */
    public function unreadReplies(string $letterboxToken): array
    {
        $letterboxId = $this->validLetterboxId($letterboxToken);

        return $letterboxId === null ? [] : $this->letters->unreadReplies($letterboxId);
    }

    /**
     * @param mixed $ids
     */
    public function markRead(string $letterboxToken, mixed $ids): int
    {
        if (!is_array($ids) || !array_is_list($ids) || $ids === []) {
            throw new ValidationException(['letterIds' => ['既読にする返信を指定してください']]);
        }
        $normalized = array_values(array_unique(array_filter(
            array_map(static fn(mixed $id): int => is_int($id) ? $id : 0, $ids),
            static fn(int $id): bool => $id > 0,
        )));
        if ($normalized === [] || count($normalized) > 50) {
            throw new ValidationException(['letterIds' => ['返信IDは1〜50件で指定してください']]);
        }

        $letterboxId = $this->validLetterboxId($letterboxToken);
        if ($letterboxId === null) {
            return 0;
        }

        return $this->letters->markRepliesRead($letterboxId, $normalized);
    }

    /**
     * @return array{items: list<Letter>, total: int, page: int, limit: int}
     */
    public function adminPage(int $page, int $limit): array
    {
        $page = max(1, $page);
        $limit = min(100, max(1, $limit));

        return $this->letters->page($page, $limit) + ['page' => $page, 'limit' => $limit];
    }

    public function reply(int $id, string $reply, int $actorId, string $requestId): Letter
    {
        $reply = trim($reply);
        if ($reply === '' || mb_strlen($reply) > 5_000) {
            throw new ValidationException(['reply' => ['返信は1〜5000文字で入力してください']]);
        }
        $letter = $this->letters->reply($id, $reply)
            ?? throw new ApiException('LETTER_NOT_FOUND', '手紙が見つかりません', 404);
        $this->audit->record('letter.replied', $actorId, 'letter', (string) $id, $requestId);

        return $letter;
    }

    public function delete(int $id, int $actorId, string $requestId): void
    {
        if (!$this->letters->delete($id)) {
            throw new ApiException('LETTER_NOT_FOUND', '手紙が見つかりません', 404);
        }
        $this->audit->record('letter.deleted', $actorId, 'letter', (string) $id, $requestId);
    }

    /**
     * @param array<string, mixed> $input
     *
     * @return array{string, ?string, string}
     */
    private function validateLetter(array $input): array
    {
        $name = trim((string) ($input['name'] ?? ''));
        $email = trim((string) ($input['email'] ?? ''));
        $message = trim((string) ($input['message'] ?? ''));
        $errors = [];

        if ($name === '' || mb_strlen($name) > 80) {
            $errors['name'][] = '名前は1〜80文字で入力してください';
        }
        if ($email !== '' && (mb_strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false)) {
            $errors['email'][] = 'メールアドレスが正しくありません';
        }
        if ($message === '' || mb_strlen($message) > 5_000) {
            $errors['message'][] = '本文は1〜5000文字で入力してください';
        }
        if ($errors !== []) {
            throw new ValidationException($errors);
        }

        return [$name, $email === '' ? null : $email, $message];
    }

    private function validLetterboxId(string $token): ?int
    {
        if ($token === '') {
            return null;
        }

        return $this->letterboxes->findValidId(hash('sha256', $token), new DateTimeImmutable());
    }

    private static function opaqueToken(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }
}
