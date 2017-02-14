## Introduction

Waldur HomePort is web-based client for the [Waldur MasterMind][4].
It uses npm and [bower.io][1] as package manager and [grunt][2] and webpack for automation.

## System Requirements

__Development/testing__:

- Linux (CentOS 7 and Ubuntu 14.04 tested) or OS X
- 2 GB of RAM

## Installation

__Installation steps__:

1. Install dependencies. Example for CentOS 7:

```
yum -y install epel-release https://rpm.nodesource.com/pub_4.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm
yum -y install bzip2 git libjpeg-turbo-devel libpng-devel libtool make nasm "nodejs-4*" rubygems

gem install sass
npm install -g bower grunt-cli
```

2. Clone project and go to its folder:

```
git clone git@code.opennodecloud.com:nc-saas/nodeconductor-web.git
cd nodeconductor-web
```

3. Build static assets:


```
npm install
bower install
```

4. Create `/app/scripts/configs/custom-config.json`:

```
cp app/scripts/configs/config.json.example app/scripts/configs/config.json
```

5. Configure `config.json`. Please read [Configuration guide](docs/config.md) to learn more.

6. Run application: `npm start`.

Server will listen on `//localhost:8000`

## Backend

Use [Waldur MasterMind][4] for backend. Note that django-cors configuration must set the following lines in the config file of Waldur MasterMind. It is needed for enabling reading header's response from frontend app:

```
INSTALLED_APPS += ('corsheaders',)
MIDDLEWARE_CLASSES = ('corsheaders.middleware.CorsMiddleware',) + MIDDLEWARE_CLASSES
CORS_ORIGIN_ALLOW_ALL = True
CORS_EXPOSE_HEADERS = (
    'x-result-count',
    'Link',
)
```

## Development process

See [Development guidelines](docs/development_guideline.md) for development policies.

[1]: http://bower.io
[2]: http://gruntjs.com
[4]: https://code.opennodecloud.com/nodeconductor/nodeconductor-assembly-waldur
