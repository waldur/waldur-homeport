# Introduction

NodeConductor-web is a thin web-based client for the NodeConductor REST client.

## Package manger [bower.io][5]

All packages from bower are copied to `dev/`

## Automation

* [grunt][6]

## Usage

Build requirements:

* `libpng-devel` on CentOS or `libpng-dev` on Ubuntu
* `npm`
* `rubygems`

Install dependencies and build static assets:

    gem install sass
    npm install
    npm install -g grunt-cli
    grunt build

Run application in development mode:

    grunt

listen on `//localhost:8000`

[5]: http://bower.io
[6]: http://gruntjs.com


## Expected backend(only for develop)

1. Setup nodeconductor project
2. Install nodeconductor-plus app to nodecinductor project
3. Install django-cors-headers


## TESTS

To start tests:

    grunt test