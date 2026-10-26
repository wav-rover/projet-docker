<?php

namespace App\Tests;

use Symfony\Component\HttpClient\Response\JsonMockResponse;
use Symfony\Component\HttpClient\Response\MockResponse;

/**
 * Fakes the auth and chalet services in the test environment.
 */
final class MockApiResponses
{
    public const USERS = [
        'user-token' => ['id' => 1, 'email' => 'user@test.fr', 'roles' => ['ROLE_USER']],
        'other-token' => ['id' => 2, 'email' => 'other@test.fr', 'roles' => ['ROLE_USER']],
    ];

    public const CHALETS = [
        1 => ['id' => 1, 'name' => 'Chalet Test', 'location' => 'Zermatt, Valais', 'pricePerNight' => 200, 'capacity' => 4],
    ];

    public function __invoke(string $method, string $url, array $options): MockResponse
    {
        $authorization = $options['normalized_headers']['authorization'][0] ?? '';
        $token = str_replace('Authorization: Bearer ', '', $authorization);
        $path = parse_url($url, PHP_URL_PATH);

        if ($path === '/me') {
            return isset(self::USERS[$token])
                ? new JsonMockResponse(self::USERS[$token])
                : new JsonMockResponse(['error' => 'Unauthorized'], ['http_code' => 401]);
        }

        if (preg_match('#^/chalets/(\d+)$#', $path, $matches) && isset(self::CHALETS[(int) $matches[1]])) {
            return new JsonMockResponse(self::CHALETS[(int) $matches[1]]);
        }

        return new JsonMockResponse(['error' => 'Not found'], ['http_code' => 404]);
    }
}
