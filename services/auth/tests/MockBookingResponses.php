<?php

namespace App\Tests;

use Symfony\Component\HttpClient\Response\MockResponse;

/**
 * Fakes the booking service in the test environment and records the calls it receives.
 */
final class MockBookingResponses
{
    /** @var list<string> */
    public static array $requests = [];

    public static bool $isAvailable = true;

    public static function reset(): void
    {
        self::$requests = [];
        self::$isAvailable = true;
    }

    public function __invoke(string $method, string $url): MockResponse
    {
        self::$requests[] = $method.' '.parse_url($url, PHP_URL_PATH);

        return new MockResponse('', ['http_code' => self::$isAvailable ? 204 : 503]);
    }
}
