<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Repository\BookingRepository;
use App\Security\RemoteUser;
use App\Service\BookingRules;
use App\Service\ChaletClient;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class CreateBookingController
{
    #[Route('/bookings', name: 'create_booking', methods: ['POST'])]
    public function __invoke(
        Request $request,
        #[CurrentUser] RemoteUser $user,
        ChaletClient $chalets,
        BookingRepository $bookings,
        EntityManagerInterface $entityManager,
    ): JsonResponse {
        $data = $request->toArray();
        $chaletId = $data['chaletId'] ?? null;
        $guests = $data['guests'] ?? null;
        $startDate = self::parseDate($data['startDate'] ?? null);
        $endDate = self::parseDate($data['endDate'] ?? null);

        if (!is_int($chaletId) || !is_int($guests) || $startDate === null || $endDate === null) {
            return new JsonResponse(['error' => 'Chalet, dates (AAAA-MM-JJ) et nombre de personnes requis.'], 400);
        }

        $chalet = $chalets->find($chaletId, $request->headers->get('Authorization', ''));

        if ($chalet === null) {
            return new JsonResponse(['error' => 'Chalet introuvable.'], 404);
        }

        $error = BookingRules::validate($startDate, $endDate, $guests, $chalet['capacity'], new \DateTimeImmutable('today'));

        if ($error !== null) {
            return new JsonResponse(['error' => $error], 400);
        }

        if ($bookings->isChaletBooked($chaletId, $startDate, $endDate)) {
            return new JsonResponse(['error' => 'Ce chalet est déjà réservé sur ces dates.'], 409);
        }

        $booking = new Booking($user->id, $chaletId, $chalet['name'], $startDate, $endDate, $guests, $chalet['pricePerNight']);
        $entityManager->persist($booking);
        $entityManager->flush();

        return new JsonResponse($booking->toArray(), 201);
    }

    private static function parseDate(mixed $value): ?\DateTimeImmutable
    {
        if (!is_string($value)) {
            return null;
        }

        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);

        // Rejects overflowing dates such as 2026-02-31, which PHP would silently shift
        return $date !== false && $date->format('Y-m-d') === $value ? $date : null;
    }
}
