<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\Argument;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(name: 'app:create-admin', description: 'Crée un compte administrateur')]
final class CreateAdminCommand
{
    public function __construct(
        private UserRepository $users,
        private UserPasswordHasherInterface $hasher,
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function __invoke(#[Argument] string $email, #[Argument] string $password, SymfonyStyle $io): int
    {
        if ($this->users->findOneBy(['email' => $email]) !== null) {
            $io->error('Cet email est déjà utilisé.');

            return Command::FAILURE;
        }

        $admin = (new User())->setEmail($email)->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->hasher->hashPassword($admin, $password));

        $this->entityManager->persist($admin);
        $this->entityManager->flush();

        $io->success("Admin $email créé.");

        return Command::SUCCESS;
    }
}