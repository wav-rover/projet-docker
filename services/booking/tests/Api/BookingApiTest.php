<?php

namespace App\Tests\Api;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class BookingApiTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient();
    }

    public function testBookingRequiresToken(): void
    {
        $this->client->jsonRequest('POST', '/bookings', $this->stay());

        self::assertResponseStatusCodeSame(401);
    }

    public function testBookingRejectsInvalidToken(): void
    {
        $this->request('POST', '/bookings', 'fake-token', $this->stay());

        self::assertResponseStatusCodeSame(401);
    }

    public function testCreatesBookingWithPriceFromChaletService(): void
    {
        $booking = $this->request('POST', '/bookings', 'user-token', $this->stay(nights: 3));

        self::assertResponseStatusCodeSame(201);
        self::assertSame('Chalet Test', $booking['chaletName']);
        self::assertSame(600, $booking['totalPrice']);
        self::assertSame('pending', $booking['status']);
    }

    public function testRejectsUnknownChalet(): void
    {
        $this->request('POST', '/bookings', 'user-token', [...$this->stay(), 'chaletId' => 999]);

        self::assertResponseStatusCodeSame(404);
    }

    public function testRejectsTooManyGuests(): void
    {
        $this->request('POST', '/bookings', 'user-token', [...$this->stay(), 'guests' => 5]);

        self::assertResponseStatusCodeSame(400);
    }

    public function testRejectsInvalidDate(): void
    {
        $this->request('POST', '/bookings', 'user-token', [...$this->stay(), 'startDate' => '2026-02-31']);

        self::assertResponseStatusCodeSame(400);
    }

    public function testRejectsOverlappingBooking(): void
    {
        $this->request('POST', '/bookings', 'user-token', $this->stay(startInDays: 10, nights: 5));
        $this->request('POST', '/bookings', 'other-token', $this->stay(startInDays: 12, nights: 5));

        self::assertResponseStatusCodeSame(409);
    }

    public function testAllowsBackToBackBookings(): void
    {
        $this->request('POST', '/bookings', 'user-token', $this->stay(startInDays: 10, nights: 5));
        $this->request('POST', '/bookings', 'other-token', $this->stay(startInDays: 15, nights: 2));

        self::assertResponseStatusCodeSame(201);
    }

    public function testListsOnlyMyBookings(): void
    {
        $this->request('POST', '/bookings', 'user-token', $this->stay(startInDays: 10));
        $this->request('POST', '/bookings', 'other-token', $this->stay(startInDays: 20));

        $bookings = $this->request('GET', '/bookings', 'user-token');

        self::assertResponseIsSuccessful();
        self::assertCount(1, $bookings);
    }

    public function testPaysBookingOnlyOnce(): void
    {
        $booking = $this->request('POST', '/bookings', 'user-token', $this->stay());

        $paid = $this->request('POST', "/bookings/{$booking['id']}/pay", 'user-token');
        self::assertResponseIsSuccessful();
        self::assertSame('paid', $paid['status']);

        $this->request('POST', "/bookings/{$booking['id']}/pay", 'user-token');
        self::assertResponseStatusCodeSame(409);
    }

    public function testCannotPayOrCancelSomeoneElsesBooking(): void
    {
        $booking = $this->request('POST', '/bookings', 'user-token', $this->stay());

        $this->request('POST', "/bookings/{$booking['id']}/pay", 'other-token');
        self::assertResponseStatusCodeSame(404);

        $this->request('DELETE', "/bookings/{$booking['id']}", 'other-token');
        self::assertResponseStatusCodeSame(404);
    }

    public function testPayOrCancelUnknownBookingReturns404(): void
    {
        $this->request('POST', '/bookings/999/pay', 'user-token');
        self::assertResponseStatusCodeSame(404);

        $this->request('DELETE', '/bookings/999', 'user-token');
        self::assertResponseStatusCodeSame(404);
    }

    public function testCancelsBooking(): void
    {
        $booking = $this->request('POST', '/bookings', 'user-token', $this->stay());

        $this->request('DELETE', "/bookings/{$booking['id']}", 'user-token');
        self::assertResponseStatusCodeSame(204);

        self::assertCount(0, $this->request('GET', '/bookings', 'user-token'));
    }

    public function testUserCanDeleteOwnBookings(): void
    {
        $this->request('POST', '/bookings', 'user-token', $this->stay());

        $this->request('DELETE', '/users/1/bookings', 'user-token');
        self::assertResponseStatusCodeSame(204);

        self::assertCount(0, $this->request('GET', '/bookings', 'user-token'));
    }

    public function testUserCannotDeleteSomeoneElsesBookings(): void
    {
        $this->request('POST', '/bookings', 'user-token', $this->stay());

        $this->request('DELETE', '/users/1/bookings', 'other-token');
        self::assertResponseStatusCodeSame(403);

        self::assertCount(1, $this->request('GET', '/bookings', 'user-token'));
    }

    public function testAdminDeletesOnlyTheTargetUserBookings(): void
    {
        $this->request('POST', '/bookings', 'user-token', $this->stay(startInDays: 10));
        $this->request('POST', '/bookings', 'other-token', $this->stay(startInDays: 20));

        $this->request('DELETE', '/users/1/bookings', 'admin-token');
        self::assertResponseStatusCodeSame(204);

        self::assertCount(0, $this->request('GET', '/bookings', 'user-token'));
        self::assertCount(1, $this->request('GET', '/bookings', 'other-token'));
    }

    private function stay(int $startInDays = 10, int $nights = 3): array
    {
        $startDate = new \DateTimeImmutable("+$startInDays days");

        return [
            'chaletId' => 1,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $startDate->modify("+$nights days")->format('Y-m-d'),
            'guests' => 2,
        ];
    }

    private function request(string $method, string $uri, string $token, array $data = []): ?array
    {
        $this->client->jsonRequest($method, $uri, $data, ['HTTP_AUTHORIZATION' => "Bearer $token"]);

        return json_decode($this->client->getResponse()->getContent() ?: 'null', true);
    }
}
