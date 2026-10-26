<?php

namespace App\Controller;

use App\Repository\SessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class LogoutController
{
    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function __invoke(
        Request $request,
        SessionRepository $sessions,
        EntityManagerInterface $entityManager,
    ): Response {
        $token = str_replace('Bearer ', '', $request->headers->get('Authorization', ''));
        $session = $sessions->findOneBy(['token' => $token]);

        if ($session !== null) {
            $entityManager->remove($session);
            $entityManager->flush();
        }

        return new Response(null, 204);
    }
}