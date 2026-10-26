<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Security\RemoteUser;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class CancelBookingController
{
    #[Route('/bookings/{id<\d+>}', name: 'cancel_booking', methods: ['DELETE'])]
    public function __invoke(Booking $booking, #[CurrentUser] RemoteUser $user, EntityManagerInterface $entityManager): Response
    {
        if ($booking->getUserId() !== $user->id) {
            return new JsonResponse(['error' => 'Réservation introuvable.'], 404);
        }

        $entityManager->remove($booking);
        $entityManager->flush();

        return new Response(null, 204);
    }
}
