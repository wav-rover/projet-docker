<?php

namespace App\Security;

use Symfony\Component\Security\Core\User\UserInterface;

/**
 * User returned by the auth service: never stored in this service's database.
 */
final class RemoteUser implements UserInterface
{
    /**
     * @param list<string> $roles
     */
    public function __construct(
        public readonly int $id,
        private readonly string $email,
        private readonly array $roles,
    ) {
    }

    public function getRoles(): array
    {
        return $this->roles;
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }
}
