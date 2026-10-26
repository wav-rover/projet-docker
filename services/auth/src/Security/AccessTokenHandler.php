<?php

namespace App\Security;

use App\Repository\SessionRepository;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

final class AccessTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(private SessionRepository $sessions)
    {
    }

    public function getUserBadgeFrom(#[\SensitiveParameter] string $accessToken): UserBadge
    {
        $session = $this->sessions->findOneBy(['token' => $accessToken]);

        if ($session === null || $session->getExpiresAt() < new \DateTimeImmutable()) {
            throw new BadCredentialsException('Token invalide ou expiré.');
        }

        return new UserBadge($session->getOwner()->getUserIdentifier());
    }
}