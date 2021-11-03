# Introduction

Waldur HomePort is a web-based client for the [Waldur MasterMind][1].
It uses yarn for dependency management and webpack as module bundler.

## Minimal requirements

- Linux Ubuntu, OS X or Windows Subsystem for Linux 2 with Ubuntu
- 2 GB of RAM and 2 GB of storage

## Installation

1. Update system and install basic dependencies:

Example for Linux Ubuntu:

```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install git wget
```

1. Install Node LTS and yarn:

```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
npm install -g yarn
```

1. Clone project and go to its folder:

```bash
git clone <repository-url>
cd waldur-homeport
```

1. Install dependencies via yarn:

```bash
yarn
```

PS. If you see errors related to fsevents on OS X, the workaround is: `yarn cache clean && yarn upgrade && yarn`.

1. Create `/src/configs/config.json`:

```bash
cp src/configs/config.json.example src/configs/config.json
```

1. Configure `config.json`. Please read [Configuration guide](docs/config.md) to learn more.

1. Run application: `yarn start`.

Server will listen on `//localhost:8001`

## Backend configuration

Use [Waldur MasterMind][1] for backend.

Also you should install django-cors-headers from pip in order to add CORS headers:

```bash
pip install django-cors-headers
```

Then you should update `waldur_core/server/settings.py` and add the following
lines at the end of the file:

```bash
INSTALLED_APPS += ('corsheaders',)
MIDDLEWARE = ('corsheaders.middleware.CorsMiddleware',) + MIDDLEWARE
CORS_ORIGIN_ALLOW_ALL = True
CORS_EXPOSE_HEADERS = (
    'x-result-count',
    'Link',
)
```

## Development process

See [Development guidelines](docs/development_guideline.md) for development policies.

[1]: https://github.com/waldur/waldur-mastermind
