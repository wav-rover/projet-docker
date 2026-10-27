<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class BookingClient
{
    public function __construct(private HttpClientInterface $bookingClient)
    {
    }

    /**
     * Returns false when the booking service refused or could not be reached.
     */
    public function deleteUserBookings(int $userId, string $authorization): bool
    {
        try {
            $response = $this->bookingClient->request('DELETE', "/users/$userId/bookings", [
                'headers' => ['Authorization' => $authorization],
            ]);

            return $response->getStatusCode() === 204;
        } catch (TransportExceptionInterface) {
            return false;
        }
    }
}
