## Introduction

NodeConductor-web is a thin web-based client for the NodeConductor REST client.
It uses [bower.io][1] as package manager and [grunt][2] for automation.

## System Requirements

__Development/testing__:

- Linux (CentOS 7 and Ubuntu 14.04 tested) or OS X
- 2 GB of RAM

## Installation

__Installation steps__:

1. Clone project and go to its folder:

        git clone git@code.opennodecloud.com:nc-saas/nodeconductor-web.git
        cd nodeconductor-web

2. Install dependencies. Example for CentOS 7:

        yum -y install epel-release https://rpm.nodesource.com/pub_4.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm
        yum -y install nodejs rubygems

        gem install sass
        npm install -g bower grunt-cli

3. Build static assets:

        npm install
        bower install

4. Create `/app/scripts/configs/custom-config.js`:

        cp app/scripts/configs/custom-config.js.example app/scripts/configs/custom-config.js

5. Configure `custom-config.js`

6. Run application:

    `grunt` - in development mode

    `grunt prod` - in production mode

    Or choose specific mode by passing additional paramater:

     `grunt --mode=modePrivateIaas`
     
     `grunt --mode=modeSquStudentCloud`
     
     `grunt --mode=modePublicBrokerage`
     
     `grunt --mode=modeCostTracking`

     `grunt --mode=modePortal`

Server will listen on `//localhost:8000`

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

1. Install dependencies. Example for CentOS 7:

         yum -y install Xvfb https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm

2. Update WebdriverJS:

        node_modules/protractor/bin/webdriver-manager update

3. (headless servers only) Start X:

        Xvfb :0 -ac -screen 0 1920x1080x24 &
        export DISPLAY=:0

4. Create `custom-config.js` for testing:

        cp app/scripts/configs/test/custom-config.js.example app/scripts/configs/test/custom-config.js

### Run all tests at once

Command `grunt test` will start local server on separate host and run all tests.

Notice: `Error: ECONNREFUSED connect ECONNREFUSED` Can be raised in the end of tests flow.
It occurs because selenium server shuts down before protractor ends tests. ([Link to issue][7]).

Google Chrome is used by default for running tests. If you want to use Mozilla Firefox instead,
pass `--browser=firefox`, for example `grunt -v testModeDevelop --browser=firefox`

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

In order to use JIRA support, please specify in what project to create a ticket, and set value of `supportProjectUUID` parameter in `CUSTOMENV`.

## Development process

See `docs/development_guideline.md` for development policies.


[1]: http://bower.io
[2]: http://gruntjs.com
[3]: https://github.com/sahat/satellizer/#obtaining-oauth-keys
[4]: https://code.opennodecloud.com/nodeconductor/nodeconductor/blob/develop/README.rst
[5]: https://code.opennodecloud.com/nc-saas/ncplus/blob/develop/README.rst
[6]: http://angular.github.io/protractor/#/tutorial
[7]: https://github.com/teerapap/grunt-protractor-runner/issues/111
