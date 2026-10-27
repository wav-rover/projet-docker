<?php

namespace App\Controller;

use App\Repository\BookingRepository;
use App\Security\RemoteUser;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/**
 * Called by the auth service right before an account is deleted.
 */
final class DeleteUserBookingsController
{
    #[Route('/users/{id<\d+>}/bookings', name: 'delete_user_bookings', methods: ['DELETE'])]
    public function __invoke(int $id, #[CurrentUser] RemoteUser $user, BookingRepository $bookings): Response
    {
        if ($user->id !== $id && !in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            return new JsonResponse(['error' => 'Vous ne pouvez supprimer que vos propres réservations.'], 403);
        }

        $bookings->deleteByUserId($id);

        return new Response(null, 204);
    }
}
