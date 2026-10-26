<?php

namespace App\Service;

final class BookingRules
{
    public const MAX_NIGHTS = 30;

    /**
     * Returns an error message, or null when the stay is valid.
     */
    public static function validate(
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
        int $guests,
        int $capacity,
        \DateTimeImmutable $today,
    ): ?string {
        if ($startDate < $today) {
            return 'La date d\'arrivée ne peut pas être dans le passé.';
        }

        if ($endDate <= $startDate) {
            return 'La date de départ doit être après la date d\'arrivée.';
        }

        if ($startDate->diff($endDate)->days > self::MAX_NIGHTS) {
            return sprintf('Un séjour ne peut pas dépasser %d nuits.', self::MAX_NIGHTS);
        }

        if ($guests < 1 || $guests > $capacity) {
            return sprintf('Ce chalet accueille de 1 à %d personnes.', $capacity);
        }

        return null;
    }
}
