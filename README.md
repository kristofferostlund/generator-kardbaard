# generator-kardbaard

> A [Yeoman generator](http://yeoman.io/) for scaffolding parts of [Kardbaard](https://github.com/kristofferostlund/kardbaard) (or any other Node.js app structured similarly).

## Getting started

Start with cloning the repository:

```bash
git clone https://github.com/kristofferostlund/generator-kardbaard.git
```

Then `cd` into the folder and install dependencies.

```bash
# cd into the folder
cd generator-kardbaard

# install dependencies
npm install
```

When the installation is finished, link the repo for access via `yo kardbaard` from the command line.

```bash
npm link
```

## Generators

### kardbaard

```bash
yo kardbaard [name]
```

Scaffolds ouit the base application.

### kardbaard:route

```bash
yo kardbaard:route [name]
```

Adds an API endpoint to the server.

### kardbaard:service

```bash
yo kardbaard:service [name]
```

Adds a service to the server.

### kardbaard:component

```bash
yo kardbaard:component [name]
```

Adds a Vue component to the frontend application.

### kardbaard:tsd

```bash
yo kardbaard:tsd
```

### kardbaard:lock

Locks dependencies and devDependencies in the package.json file in the current folder.

```bash
yo kardbaard:lock
```

Installs d.ts files for all dependencies and dev-dependencies in the `package.json` file.
