#!/bin/bash
# load the test env file
source .env.test.local
# start testing db
docker run -d --name testing-db -e MARIADB_ROOT_PASSWORD="$DB_PASSWORD" -e MYSQL_DATABASE="$DB_DATABASE" -p "$DB_PORT:3306" mariadb:latest
echo "wait 5s for DB startup"
sleep 5
yarn migrate
