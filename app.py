#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys

from flask import Flask, render_template, url_for, request
from flask_frozen import Freezer

# config
DEBUG = True

# BASE_URL = 'http://localhost:8000'
# FREEZER_BASE_URL = 'http://localhost:8000'

FREEZER_DESTINATION = 'prototype'
FREEZER_RELATIVE_URLS = True

# app
app = Flask(__name__)
app.config.from_object(__name__)
freezer = Freezer(app) 

# views
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login/')
def login():
    return render_template('login.html')

@app.route('/intial-data/')
def initial_data():
    return render_template('intial-data.html')

@app.route('/plans/')
def plans():
    return render_template('plans.html')

@app.route('/dashboard/')
def dashboard():
    return render_template('dashboard.html', current = 'dashboard')

@app.route('/events/')
def events():
    return render_template('events.html', current = 'events')

@app.route('/event/')
def event():
    return render_template('event.html', current = 'events')

@app.route('/projects/')
def projects():
    return render_template('projects.html', current = 'projects')

@app.route('/project/')
def project():
    return render_template('project.html', current = 'projects')

@app.route('/resources/')
def resources():
    return render_template('resources.html', current = 'resources')

@app.route('/user/')
def user():
    return render_template('user.html', current = 'user')

@app.route('/user/edit/')
def user_edit():
    return render_template('user-edit.html', current = 'user')

@app.route('/add-project/')
def addproject():
    return render_template('add-project.html')

@app.route('/add-resource/')
def addresource():
    return render_template('add-resource.html')

# @app.route('/404.html')
# def error404():
#     return render_template('404.html')

# @app.errorhandler(404)
# def page_not_found(error):
#     return render_template('404.html'), 404

# freezer

def make_external(url):
    return urljoin(request.url_root, url)

# @freezer.register_generator
# def pages_frozen():
#     for page in pages:
#         yield '/%s/' % page.path


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == "build":
        freezer.freeze()
    else:
        app.run(port=8000)
