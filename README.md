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

listen on `//localhost:8000/app/`

[5]: http://bower.io
[6]: http://gruntjs.com
