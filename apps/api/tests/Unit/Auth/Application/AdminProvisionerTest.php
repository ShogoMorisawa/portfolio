<?php

declare(strict_types=1);

namespace Tests\Unit\Auth\Application;

use App\Auth\Application\AdminCredentialRepository;
use App\Auth\Application\AdminProvisioner;
use App\Auth\Model\AdminUser;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class AdminProvisionerTest extends TestCase
{
    #[Test]
    public function itHashesAndStoresValidCredentials(): void
    {
        $repository = $this->createMock(AdminCredentialRepository::class);
        $repository
            ->expects(self::once())
            ->method('upsertCredentials')
            ->with(
                'admin.user',
                self::callback(static fn(string $hash): bool => password_verify('correct horse battery', $hash)),
            )
            ->willReturn(new AdminUser(1, 'admin.user', 'stored-hash'));

        $admin = (new AdminProvisioner($repository))->provision(' admin.user ', 'correct horse battery');

        self::assertSame(1, $admin->id);
    }

    #[Test]
    public function itRejectsAnInvalidUsername(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new AdminProvisioner($this->createStub(AdminCredentialRepository::class)))
            ->provision('not an email', 'correct horse battery');
    }

    #[Test]
    public function itRejectsAShortPassword(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new AdminProvisioner($this->createStub(AdminCredentialRepository::class)))
            ->provision('admin', 'too-short');
    }
}
