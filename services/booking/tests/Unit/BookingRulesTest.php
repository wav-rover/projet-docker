<?php

namespace App\Tests\Unit;

use App\Entity\Booking;
use App\Service\BookingRules;
use PHPUnit\Framework\TestCase;

final class BookingRulesTest extends TestCase
{
    private \DateTimeImmutable $today;

    protected function setUp(): void
    {
        $this->today = new \DateTimeImmutable('2026-12-01');
    }

    public function testValidStayHasNoError(): void
    {
        self::assertNull(BookingRules::validate($this->date('2026-12-10'), $this->date('2026-12-15'), 2, 4, $this->today));
    }

    public function testStartDateCannotBeInThePast(): void
    {
        self::assertNotNull(BookingRules::validate($this->date('2026-11-30'), $this->date('2026-12-05'), 2, 4, $this->today));
    }

    public function testEndDateMustBeAfterStartDate(): void
    {
        self::assertNotNull(BookingRules::validate($this->date('2026-12-10'), $this->date('2026-12-10'), 2, 4, $this->today));
    }

    public function testStayCannotExceedMaxNights(): void
    {
        self::assertNotNull(BookingRules::validate($this->date('2026-12-01'), $this->date('2027-01-15'), 2, 4, $this->today));
    }

    public function testGuestsCannotExceedCapacity(): void
    {
        self::assertNotNull(BookingRules::validate($this->date('2026-12-10'), $this->date('2026-12-15'), 5, 4, $this->today));
    }

    public function testTotalPriceIsNightsTimesPricePerNight(): void
    {
        $booking = new Booking(1, 1, 'Chalet Test', $this->date('2026-12-10'), $this->date('2026-12-15'), 2, 200);

        self::assertSame(5, $booking->getNights());
        self::assertSame(1000, $booking->toArray()['totalPrice']);
    }

    private function date(string $value): \DateTimeImmutable
    {
        return new \DateTimeImmutable($value);
    }
}
