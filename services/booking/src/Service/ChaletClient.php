<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

final class ChaletClient
{
    public function __construct(private HttpClientInterface $chaletClient)
    {
    }

    /**
     * @return array{id: int, name: string, pricePerNight: int, capacity: int}|null
     */
    public function find(int $id, string $authorization): ?array
    {
        $response = $this->chaletClient->request('GET', "/chalets/$id", ['headers' => ['Authorization' => $authorization]]);

        return $response->getStatusCode() === 200 ? $response->toArray() : null;
    }
}
