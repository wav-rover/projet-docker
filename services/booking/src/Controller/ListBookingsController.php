<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Repository\BookingRepository;
use App\Security\RemoteUser;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class ListBookingsController
{
    #[Route('/bookings', name: 'list_bookings', methods: ['GET'])]
    public function __invoke(#[CurrentUser] RemoteUser $user, BookingRepository $bookings): JsonResponse
    {
        return new JsonResponse(array_map(
            fn (Booking $booking) => $booking->toArray(),
            $bookings->findBy(['userId' => $user->id], ['startDate' => 'ASC']),
        ));
    }
}
