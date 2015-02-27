## Introduction

NodeConductor-web is a thin web-based client for the NodeConductor REST client.
It uses [bower.io][1] as package manager and [grunt][2] for automation.

## Installation

__Requirements__:

* `libpng-devel` on CentOS or `libpng-dev` on Ubuntu
* `npm`
* `rubygems`

__Installation steps__:

1. Clone project and go to its folder:

        git clone git@code.opennodecloud.com:nc-saas/nodeconductor-web.git
        cd nodeconductor-web

2. Install dependencies and build static assets:

        gem install sass
        npm install
        npm install -g grunt-cli
        bower install

3. Create `/app/scripts/configs/custom-config.js`:

        cp app/scripts/configs/custom-config.js.example app/scripts/configs/custom-config.js

4. Configure `custom-config.js`

5. Run application in development mode:

        grunt

6. Listen on `//localhost:8000`


## Backend

Use [NodeConductor][4] with [NodeConductorPlus][5] for backend.

Also django-cors configuration must set the following lines in the config file of NodeConductor:

CORS_EXPOSE_HEADERS = (
        'x-result-count',
        'Link'
)
It is needed for enable reading header's response from frontend app.
## Tests

To start tests:

    grunt test


## Configuration

### Authentication configurations

Nodeconductor-web allows authentication through GooglePlus and Facebook.
[This instructions][3] can be used for Google or Facebook application creation.
Application public id has to be set as `googleClientId` or `facebookClientId` parameters in `CUSTOMENV`.


## Development process

See `docs/development_guideline.md` for development policies.


[1]: http://bower.io
[2]: http://gruntjs.com
[3]: https://github.com/sahat/satellizer/#obtaining-oauth-keys
[4]: https://code.opennodecloud.com/nodeconductor/nodeconductor/blob/develop/README.rst
[5]: https://code.opennodecloud.com/nc-saas/ncplus/blob/develop/README.rst
