<?php

namespace App\Controller;

use App\Entity\Session;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

final class LoginController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function __invoke(
        Request $request,
        UserRepository $users,
        UserPasswordHasherInterface $hasher,
        EntityManagerInterface $entityManager,
    ): JsonResponse {
        $data = $request->toArray();
        $user = $users->findOneBy(['email' => trim($data['email'] ?? '')]);

        if ($user === null || !$hasher->isPasswordValid($user, $data['password'] ?? '')) {
            return new JsonResponse(['error' => 'Identifiants invalides.'], 401);
        }

        $session = (new Session())
            ->setToken(bin2hex(random_bytes(32)))
            ->setOwner($user)
            ->setExpiresAt(new \DateTimeImmutable('+1 day'));

        $entityManager->persist($session);
        $entityManager->flush();

        return new JsonResponse(['token' => $session->getToken()]);
    }
}