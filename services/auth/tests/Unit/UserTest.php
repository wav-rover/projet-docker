<?php

namespace App\Tests\Unit;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

final class UserTest extends TestCase
{
    public function testStandardUserHasOnlyRoleUser(): void
    {
        $user = new User();

        self::assertSame(['ROLE_USER'], $user->getRoles());
    }

    public function testAdminHasRoleAdminAndRoleUser(): void
    {
        $user = (new User())->setRoles(['ROLE_ADMIN']);

        self::assertEqualsCanonicalizing(['ROLE_ADMIN', 'ROLE_USER'], $user->getRoles());
    }
}
