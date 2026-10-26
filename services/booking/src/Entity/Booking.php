<?php

namespace App\Entity;

use App\Repository\BookingRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ORM\Index(fields: ['chaletId'])]
#[ORM\Index(fields: ['userId'])]
class Booking
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20)]
    private string $status = self::STATUS_PENDING;

    #[ORM\Column]
    private int $totalPrice;

    public function __construct(
        #[ORM\Column] private int $userId,
        #[ORM\Column] private int $chaletId,
        #[ORM\Column(length: 255)] private string $chaletName,
        #[ORM\Column(type: Types::DATE_IMMUTABLE)] private \DateTimeImmutable $startDate,
        #[ORM\Column(type: Types::DATE_IMMUTABLE)] private \DateTimeImmutable $endDate,
        #[ORM\Column] private int $guests,
        int $pricePerNight,
    ) {
        $this->totalPrice = $this->getNights() * $pricePerNight;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getNights(): int
    {
        return $this->startDate->diff($this->endDate)->days;
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    public function pay(): void
    {
        $this->status = self::STATUS_PAID;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'chaletId' => $this->chaletId,
            'chaletName' => $this->chaletName,
            'startDate' => $this->startDate->format('Y-m-d'),
            'endDate' => $this->endDate->format('Y-m-d'),
            'nights' => $this->getNights(),
            'guests' => $this->guests,
            'totalPrice' => $this->totalPrice,
            'status' => $this->status,
        ];
    }
}
