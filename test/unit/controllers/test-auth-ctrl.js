'use strict';

describe('Controller: AuthCtrl', function() {
  var auth, $httpBackend, signinUrl, location;

  // load the controller's module
  beforeEach(module('ncsaas'));

  // Initialize the controller and mocked backend
  beforeEach(inject(function($controller, $injector, $location, APIURL) {
    location = $location;
    auth = $controller('AuthCtrl');

    $httpBackend = $injector.get('$httpBackend');

    signinUrl = APIURL + 'ncauth/signin/';
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('signin() makes request to signin url with entered password and login', function() {
    $httpBackend.when('POST', signinUrl)
      .respond(200, {id: 2, username: 'admin', auth_token: '58b3130951ca12199109044a0a179725cbee8085'});
    auth.user.username = 'admin';
    auth.user.password = 'adminpass';
    $httpBackend.expectPOST(signinUrl, {username: auth.user.username, password: auth.user.password});

    auth.signin();

    $httpBackend.flush();
  });

  it('signin() redirects to main page on success', function() {
    $httpBackend.when('POST', signinUrl)
      .respond(200, {id: 2, username: 'admin', auth_token: '58b3130951ca12199109044a0a179725cbee8085'});

    auth.signin();

    $httpBackend.flush();
    expect(location.path()).toBe('/');
  });

  it('signin() saves errors to auth.errors variable on signin fail', function() {
    var errors = 'some error';
    $httpBackend.when('POST', signinUrl).respond(400, errors);

    auth.signin();

    $httpBackend.flush();
    expect(auth.errors).toBe(errors);
  });

  it('getErrors() returns prettified controller errors', function() {
    auth.errors = {'field': ['error1', 'error2']}
    expect(auth.getErrors()).toBe('error1\nerror2');
  });

});
