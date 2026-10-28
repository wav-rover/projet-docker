#!/bin/sh
# Runs only on the first start (empty volume): POSTGRES_DB already created "auth"
set -e

for database in chalet booking; do
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "CREATE DATABASE $database;"
done