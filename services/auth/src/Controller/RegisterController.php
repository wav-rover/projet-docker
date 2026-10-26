<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

final class RegisterController
{
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function __invoke(
        Request $request,
        UserRepository $users,
        UserPasswordHasherInterface $hasher,
        EntityManagerInterface $entityManager,
    ): JsonResponse {
        $data = $request->toArray();
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
            return new JsonResponse(['error' => 'Email invalide ou mot de passe trop court (8 caractères min).'], 400);
        }

        if ($users->findOneBy(['email' => $email]) !== null) {
            return new JsonResponse(['error' => 'Cet email est déjà utilisé.'], 409);
        }

        $user = (new User())->setEmail($email);
        $user->setPassword($hasher->hashPassword($user, $password));

        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['id' => $user->getId(), 'email' => $user->getEmail()], 201);
    }
}