<?php

namespace App\Tests\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AuthApiTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient();
    }

    public function testRegisterCreatesAccount(): void
    {
        $this->client->jsonRequest('POST', '/register', ['email' => 'new@test.fr', 'password' => 'motdepasse']);

        self::assertResponseStatusCodeSame(201);
    }

    public function testRegisterRejectsDuplicateEmail(): void
    {
        $this->createUser('taken@test.fr');

        $this->client->jsonRequest('POST', '/register', ['email' => 'taken@test.fr', 'password' => 'motdepasse']);

        self::assertResponseStatusCodeSame(409);
    }

    public function testRegisterRejectsShortPassword(): void
    {
        $this->client->jsonRequest('POST', '/register', ['email' => 'new@test.fr', 'password' => 'court']);

        self::assertResponseStatusCodeSame(400);
    }

    public function testLoginRejectsWrongPassword(): void
    {
        $this->createUser('user@test.fr');

        $this->client->jsonRequest('POST', '/login', ['email' => 'user@test.fr', 'password' => 'mauvais']);

        self::assertResponseStatusCodeSame(401);
    }

    public function testMeRequiresToken(): void
    {
        $this->client->request('GET', '/me');

        self::assertResponseStatusCodeSame(401);
    }

    public function testLogoutInvalidatesToken(): void
    {
        $this->createUser('user@test.fr');
        $token = $this->login('user@test.fr');

        $this->client->request('POST', '/logout', server: ['HTTP_AUTHORIZATION' => "Bearer $token"]);
        self::assertResponseStatusCodeSame(204);

        $this->client->request('GET', '/me', server: ['HTTP_AUTHORIZATION' => "Bearer $token"]);
        self::assertResponseStatusCodeSame(401);
    }

    public function testStandardUserCannotDeleteUsers(): void
    {
        $this->createUser('user@test.fr');
        $target = $this->createUser('target@test.fr');
        $token = $this->login('user@test.fr');

        $this->client->request('DELETE', "/users/{$target->getId()}", server: ['HTTP_AUTHORIZATION' => "Bearer $token"]);

        self::assertResponseStatusCodeSame(403);
    }

    public function testAdminCannotDeleteAdmin(): void
    {
        $this->createUser('admin@test.fr', ['ROLE_ADMIN']);
        $otherAdmin = $this->createUser('admin2@test.fr', ['ROLE_ADMIN']);
        $token = $this->login('admin@test.fr');

        $this->client->request('DELETE', "/users/{$otherAdmin->getId()}", server: ['HTTP_AUTHORIZATION' => "Bearer $token"]);

        self::assertResponseStatusCodeSame(403);
    }

    public function testAdminCanDeleteStandardUser(): void
    {
        $this->createUser('admin@test.fr', ['ROLE_ADMIN']);
        $target = $this->createUser('target@test.fr');
        $token = $this->login('admin@test.fr');

        $this->client->request('DELETE', "/users/{$target->getId()}", server: ['HTTP_AUTHORIZATION' => "Bearer $token"]);

        self::assertResponseStatusCodeSame(204);
    }

    public function testStandardUserCannotListUsers(): void
    {
        $this->createUser('user@test.fr');
        $token = $this->login('user@test.fr');

        $this->client->request('GET', '/users', server: ['HTTP_AUTHORIZATION' => "Bearer $token"]);

        self::assertResponseStatusCodeSame(403);
    }

    public function testAdminCanListUsers(): void
    {
        $this->createUser('admin@test.fr', ['ROLE_ADMIN']);
        $this->createUser('user@test.fr');
        $token = $this->login('admin@test.fr');

        $this->client->request('GET', '/users', server: ['HTTP_AUTHORIZATION' => "Bearer $token"]);

        self::assertResponseIsSuccessful();
        $emails = array_column(json_decode($this->client->getResponse()->getContent(), true), 'email');
        self::assertSame(['admin@test.fr', 'user@test.fr'], $emails);
    }

    private function createUser(string $email, array $roles = []): User
    {
        $container = static::getContainer();
        $user = (new User())->setEmail($email)->setRoles($roles);
        $user->setPassword($container->get(UserPasswordHasherInterface::class)->hashPassword($user, 'motdepasse'));

        $entityManager = $container->get(EntityManagerInterface::class);
        $entityManager->persist($user);
        $entityManager->flush();

        return $user;
    }

    private function login(string $email): string
    {
        $this->client->jsonRequest('POST', '/login', ['email' => $email, 'password' => 'motdepasse']);

        return json_decode($this->client->getResponse()->getContent(), true)['token'];
    }
}
