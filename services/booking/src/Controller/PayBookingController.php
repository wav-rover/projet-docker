<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Security\RemoteUser;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class PayBookingController
{
    /**
     * Simulated payment: no card data is collected, the booking is simply marked as paid.
     */
    #[Route('/bookings/{id<\d+>}/pay', name: 'pay_booking', methods: ['POST'])]
    public function __invoke(Booking $booking, #[CurrentUser] RemoteUser $user, EntityManagerInterface $entityManager): JsonResponse
    {
        if ($booking->getUserId() !== $user->id) {
            return new JsonResponse(['error' => 'Réservation introuvable.'], 404);
        }

        if ($booking->isPaid()) {
            return new JsonResponse(['error' => 'Cette réservation est déjà payée.'], 409);
        }

        $booking->pay();
        $entityManager->flush();

        return new JsonResponse($booking->toArray());
    }
}
