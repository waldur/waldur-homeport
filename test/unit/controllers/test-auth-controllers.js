'use strict';

describe('Controller: AuthCtrl', function() {
  var controller, $httpBackend, signinUrl, location;

  // load the controller's module
  beforeEach(module('ncsaas'));

  // Initialize the controller and mocked backend
  beforeEach(inject(function($controller, $injector, $location, ENV) {
    location = $location;
    controller = $controller('AuthCtrl');

    $httpBackend = $injector.get('$httpBackend');

    signinUrl = ENV.apiEndpoint + 'api-auth/password/';
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('signin() makes request to signin url with entered password and login', function() {
    $httpBackend.when('POST', signinUrl)
      .respond(200, {id: 2, username: 'admin', token: '58b3130951ca12199109044a0a179725cbee8085'});
    controller.user.username = 'admin';
    controller.user.password = 'adminpass';
    $httpBackend.expectPOST(signinUrl, {username: controller.user.username, password: controller.user.password});

    controller.signin();

    $httpBackend.flush();
  });

  it('signin() redirects to main page on success', function() {
    $httpBackend.when('POST', signinUrl)
      .respond(200, {id: 2, username: 'admin', token: '58b3130951ca12199109044a0a179725cbee8085'});

    controller.signin();

    $httpBackend.flush();
    expect(location.path()).toBe('/');
  });

  it('signin() saves errors to controller.errors variable on signin fail', function() {
    var errors = 'some error';
    $httpBackend.when('POST', signinUrl).respond(400, errors);

    controller.signin();

    $httpBackend.flush();
    expect(controller.errors).toBe(errors);
  });

  it('getErrors() returns prettified controller errors', function() {
    controller.errors = {field: ['error1', 'error2']};
    expect(controller.getErrors()[0]).toBe('field: error1, error2');
  });

});
