<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class DeleteUserController
{
    #[Route('/users/{id}', name: 'delete_user', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function __invoke(User $user, EntityManagerInterface $entityManager): Response
    {
        if (in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            return new JsonResponse(['error' => 'Un admin ne peut pas supprimer un autre admin.'], 403);
        }

        $entityManager->remove($user);
        $entityManager->flush();

        return new Response(null, 204);
    }
}