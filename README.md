# Introduction

Waldur HomePort is a web-based client for the [Waldur MasterMind][1].
It uses yarn for dependency management and Vite as module bundler.

## Minimal requirements

- Linux, OS X or Windows Subsystem for Linux 2 with Ubuntu
- 2 GB of RAM and 2 GB of storage

## Installation via Dev Containers

If you use VS Code or GitHub Codespaces, you can quickly set up a development environment using Dev Containers. This method provides a consistent, pre-configured environment with all necessary dependencies.

Prerequisites for Dev Containers are:

- [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) installed
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local development)
- Git

After cloning repository, when prompted "Reopen in Container", click on it. Alternatively, you can press Ctrl+Shift+P, type "Dev Containers: Reopen in Container" and press Enter.

VS Code will build the dev container and set up the environment automatically. Once the container is built and running, you'll have a fully configured development environment ready to use.

## Manual installation

1. Update system and install basic dependencies. Example for Linux Ubuntu:

   ```bash
   sudo apt-get update
   sudo apt-get upgrade
   sudo apt-get install git wget
   ```

2. Install Node LTS and yarn:

   ```bash
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
   source ~/.bashrc
   nvm install --lts
   npm install -g yarn
   ```

3. Clone project and go to its folder:

   ```bash
   git clone <repository-url>
   cd waldur-homeport
   ```

4. Install dependencies via yarn:

   ```bash
   yarn
   ```

   PS. If you see errors related to fsevents on OS X, the workaround is: `yarn cache clean && yarn upgrade && yarn`.

5. Run application: `yarn start`.

   Server will listen on `//localhost:8001`

   If your REST API runs on different host or port, specify API_URL environment variable.

   ```bash
   VITE_API_URL=http://127.0.0.1:8000/ yarn vite
   ```

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
    'x-impersonated-user-uuid',
)

# enable support for impersonation headers
from corsheaders.defaults import default_headers

CORS_ALLOW_HEADERS = (
    *default_headers,
    "X-Impersonated-User-Uuid",
)

```

[1]: https://github.com/waldur/waldur-mastermind
