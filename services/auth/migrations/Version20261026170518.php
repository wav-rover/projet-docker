<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261026170518 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE session DROP CONSTRAINT fk_d044d5d47e3c61f9');
        $this->addSql('ALTER TABLE session ADD expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL');
        $this->addSql('ALTER TABLE session ADD CONSTRAINT FK_D044D5D47E3C61F9 FOREIGN KEY (owner_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D044D5D45F37A13B ON session (token)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE session DROP CONSTRAINT FK_D044D5D47E3C61F9');
        $this->addSql('DROP INDEX UNIQ_D044D5D45F37A13B');
        $this->addSql('ALTER TABLE session DROP expires_at');
        $this->addSql('ALTER TABLE session ADD CONSTRAINT fk_d044d5d47e3c61f9 FOREIGN KEY (owner_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}
