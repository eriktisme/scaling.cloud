# Getting started

## Setup the development environment

To set up the development environment, you will need to install [Node](https://nodejs.org/en/download/)
and [PNPM](https://pnpm.io/installation).

### Prerequisite

1. Install [Node.js](https://nodejs.org). It is recommended to use [nvm](https://github.com/nvm-sh/nvm):

    ```bash
    nvm use
    ```
   
1. Install [PNPM](https://pnpm.io). It is recommended to use [corepack](https://github.com/nodejs/corepack) of Node.js:

    ```bash
    corepack enable
    ```

### Build and run the project

1. Install the dependencies:

   ```bash
   pnpm i
   ```

1. Configure the environment variables by creating a `.env.local` file based on the provided `.env.sample` file in the `apps/app` directory.

1. Run the development server:

   ```bash
   pnpm dev --filter=app

## Useful commands

- `pnpm i`: To install the external dependencies.
- `pnpm dev`: To run local development servers.
