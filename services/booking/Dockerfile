FROM dunglas/frankenphp:1-php8.5-alpine

LABEL org.opencontainers.image.title="booking" \
      org.opencontainers.image.description="Gestion des réservations (Symfony)" \
      org.opencontainers.image.version="1.0.0"

ENV APP_ENV=prod \
    SERVER_NAME=:8080

WORKDIR /app

RUN install-php-extensions pdo_pgsql \
    && cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .
# .env is not versioned: .env.example gives the defaults, docker compose overrides them at runtime
RUN cp .env.example .env \
    && composer dump-autoload --classmap-authoritative --no-dev \
    && composer dump-env prod \
    && composer run-script --no-dev post-install-cmd

COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN setcap -r /usr/local/bin/frankenphp \
    && chown -R www-data:www-data var /config/caddy /data/caddy

USER www-data

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["--config", "/etc/frankenphp/Caddyfile", "--adapter", "caddyfile"]