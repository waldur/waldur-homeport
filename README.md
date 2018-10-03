## Introduction

Waldur HomePort is web-based client for the [Waldur MasterMind][1].
It uses yarn for dependency management and webpack as module bundler.

## System Requirements

__Development/testing__:

- Linux (CentOS 7 and Ubuntu 14.04 tested) or OS X
- 2 GB of RAM

## Installation

1. Update system and install basic dependencies:
Example for CentOS 7:

```
yum --assumeyes update
yum install --assumeyes bzip2 git wget
```

Example for Ubuntu 14.04 LTS:
```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install git wget
```

2. Install stable Node.js and yarn:
```
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
source ~/.bashrc
nvm install --lts
npm install -g yarn
```

3. Clone project and go to its folder:
```
git clone <repository-url>
cd waldur-homeport
```

4. Install dependencies via yarn:
```
yarn
```

5. Create `/src/configs/custom-config.json`:
```
cp src/configs/config.json.example src/configs/config.json
```

6. Configure `config.json`. Please read [Configuration guide](docs/config.md) to learn more.

7. Run application: `yarn start`.

Server will listen on `//localhost:8001`

## Backend configuration

Use [Waldur MasterMind][1] for backend.

Also you should install django-cors-headers from pip in order to add CORS headers:

```
pip install django-cors-headers
```

Then you should update `waldur_core/server/settings.py` and add the following
lines at the end of the file:

```
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

[1]: https://github.com/opennode/waldur-mastermind
