<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\BookingClient;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class DeleteAccountController
{
    #[Route('/me', name: 'delete_account', methods: ['DELETE'])]
    public function __invoke(
        Request $request,
        #[CurrentUser] User $user,
        BookingClient $bookings,
        EntityManagerInterface $entityManager,
    ): Response {
        // Bookings go first: the token must still be valid when the booking service checks it
        if (!$bookings->deleteUserBookings($user->getId(), $request->headers->get('Authorization', ''))) {
            return new JsonResponse(['error' => 'Service de réservation indisponible, réessayez plus tard.'], 503);
        }

        $entityManager->remove($user);
        $entityManager->flush();

        return new Response(null, 204);
    }
}
