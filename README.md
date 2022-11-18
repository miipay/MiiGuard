# MiiGuard
The authentication of MiiPay

* * e2e-tests: [![Node.js CI](https://github.com/miipay/MiiGuard/actions/workflows/e2e-test.yaml/badge.svg)](https://github.com/miipay/MiiGuard/actions/workflows/e2e-test.yaml)

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Migrations

### Create an empty migration

```
yarn create-migration
```

### Create a migration based on entities

```
yarn generate-migration
```

### Migrate entities

```
yarn migrate
```

### Revert migrations (untested)

```
yarn revert-migration ...
```

## License

Nest is [MIT licensed](LICENSE).
