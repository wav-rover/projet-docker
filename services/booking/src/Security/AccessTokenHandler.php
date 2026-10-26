<?php

namespace App\Security;

use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class AccessTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(private HttpClientInterface $authClient)
    {
    }

    public function getUserBadgeFrom(#[\SensitiveParameter] string $accessToken): UserBadge
    {
        $response = $this->authClient->request('GET', '/me', ['auth_bearer' => $accessToken]);

        if ($response->getStatusCode() !== 200) {
            throw new BadCredentialsException('Token invalide ou expiré.');
        }

        $user = $response->toArray();

        return new UserBadge(
            $user['email'],
            fn () => new RemoteUser($user['id'], $user['email'], $user['roles']),
        );
    }
}
