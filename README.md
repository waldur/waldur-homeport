# project: dashboard

* *developer: [Mihail Yakiemnko][1]*
* *company: [opennodecloud.com][2]*
* *project: okei*

## Technology

* [sass][3] - for styles
* [Autoprefixer][4] - for styles
* [flask][7] - to render prototype

## Package manger [bower.io][5]

All packages from bower are copied to `dev/`

## Automation

* [grunt][6]

## Usage

Additional requirements:

* `git`
* `libpng-devel` on CentOS or `libpng-dev` on Ubuntu
* `npm`
* `rubygems`
* `python-virtualenv`

Create virtualenv and install dependencies:

    virtualenv venv
    venv/binactivate
    pip install -r requirements.txt

Install Grunt pakcages and build static:

    gem install sass
    npm install
    npm install -g grunt-cli
    grunt build

Generate prototype:

    ./app.py build

[1]: http://mihailyakimenko.com
[2]: http://whitescape.com
[3]: http://sass-lang.com
[4]: https://github.com/postcss/autoprefixer
[5]: http://bower.io
[6]: http://gruntjs.com
[7]: http://flask.pocoo.org/
