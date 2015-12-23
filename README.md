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

5. Run application:

    choose mode:
    
     `grunt modePrivateIaas`
     
     `grunt modeSquStudentCloud`
     
     `grunt modePublicBrokerage`
     
     `grunt modeCostTracking`
     
     or run with param
     
     `--mode=modePrivateIaas`
     
     `--mode=modeSquStudentCloud`
     
     `--mode=modePublicBrokerage`
     
     `--mode=modeCostTracking`

    `grunt` - in development mode

    `grunt prod` - in production mode

6. Server will listen on `//localhost:8000`

## Backend

Use [NodeConductor][4] with [NodeConductorPlus][5] for backend.

Also django-cors configuration must set the following lines in the config file of NodeConductor:

CORS_EXPOSE_HEADERS = (
        'x-result-count',
        'Link'
)
It is needed for enabling reading header's response from frontend app.

## Tests

[Protractor][6] is used for tests.

### Setup

1. Install developer dependencies from `package.json`

2. Update WebdriverJS:

        node_modules/protractor/bin/webdriver-manager update

### Run all tests at once

Command `grunt test` will start local server on separate host and run all tests.

Notice: `Error: ECONNREFUSED connect ECONNREFUSED` Can be raised in the end of tests flow.
It occurs because selenium server shuts down before protractor ends tests. ([Link to issue][7]).

### Run modes tests

Execute `grunt testModes` to run tests for each configuration mode.

### Run selected file on current develop server

1. Run `grunt protractor_webdriver:daemonize` to start Selenium Server for tests.
This server will not shut down after tests, so this command can be executed only once.

2. Start your develop server: `grunt run`

3. Execute all tests faster with `grunt protractor:fasttest`

4. Or execute concrete file with tests: `grunt protractor:fasttest --specs test/internal/some-file.js`

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
[6]: http://angular.github.io/protractor/#/tutorial
[7]: https://github.com/teerapap/grunt-protractor-runner/issues/111
