<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class ListUsersController
{
    #[Route('/users', name: 'list_users', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function __invoke(UserRepository $users): JsonResponse
    {
        return new JsonResponse(array_map(
            fn (User $user) => ['id' => $user->getId(), 'email' => $user->getEmail(), 'roles' => $user->getRoles()],
            $users->findBy([], ['email' => 'ASC']),
        ));
    }
}
