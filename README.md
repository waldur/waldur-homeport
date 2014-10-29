# project: dashboard

* *developer: [Mihail Yakiemnko][1]*
* *company: [opennodecloud.com][2]*
* *project: okei*

## Technology

* [sass][3] – for styles
* [Autoprefixer][4] – for styles
* [flask][7] - for render prototype

## Package manger [bower.io][5]

all packages from bower copied to dev/

## Automatization

* [grunt][6]

## Usage

make virtual env
activate your env & install dependens

    virtualenv env
    source env/bin/activate
    pip install -r requirements.txt

install grunt pakcages && build static

    npm install
    grunt build

generate prototype

`./app.py build`

[1]: http://mihailyakimenko.com
[2]: http://whitescape.com
[3]: http://sass-lang.com
[4]: https://github.com/postcss/autoprefixer
[5]: http://bower.io
[6]: http://gruntjs.com
[7]: http://flask.pocoo.org/
