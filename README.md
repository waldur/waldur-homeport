## Introduction

NodeConductor-web is a thin web-based client for the NodeConductor REST client.
It uses [bower.io][1] as package manager and [grunt][2] for automation.

## Installation

__Requirements__:

* `libpng-devel` on CentOS or `libpng-dev` on Ubuntu
* `npm`
* `rubygems`

__Installation steps__:

1. Install dependencies and build static assets:

        gem install sass
        npm install
        npm install -g grunt-cli
        grunt build

2. Create `/app/scripts/configs/custom-config.js`:

        cp /app/scripts/configs/custom-config.js.example /app/scripts/configs/custom-config.js

3. Configure `custom-config.js`

4. Run application in development mode:

        grunt

5. Listen on `//localhost:8000`


## Backend installation

1. Setup nodeconductor project
2. Install nodeconductor-plus app to nodecinductor project
3. Install django-cors-headers


## Tests

To start tests:

    grunt test


## Authentication configurations

Nodeconductor-web allows authentication through GooglePlus and Facebook.
[This instructions][3] can be used for Google or Facebook application creation.
Application public id has to be set as `googleCliendId` or `facebookClientId` parameter in `CUSTOMENV`.


[1]: http://bower.io
[2]: http://gruntjs.com
[3]: https://github.com/sahat/satellizer/#obtaining-oauth-keys