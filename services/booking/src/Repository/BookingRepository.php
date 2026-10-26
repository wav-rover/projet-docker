<?php

namespace App\Repository;

use App\Entity\Booking;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Booking>
 */
class BookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Booking::class);
    }

    public function isChaletBooked(int $chaletId, \DateTimeImmutable $startDate, \DateTimeImmutable $endDate): bool
    {
        // Two stays overlap when each one starts before the other ends
        return $this->createQueryBuilder('booking')
            ->select('COUNT(booking.id)')
            ->where('booking.chaletId = :chaletId')
            ->andWhere('booking.startDate < :endDate')
            ->andWhere('booking.endDate > :startDate')
            ->setParameter('chaletId', $chaletId)
            ->setParameter('startDate', $startDate, 'date_immutable')
            ->setParameter('endDate', $endDate, 'date_immutable')
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }
}
