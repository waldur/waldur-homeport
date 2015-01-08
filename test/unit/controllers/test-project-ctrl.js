'use strict';

describe('Controller: ProjectCtrl', function() {
  var controller, $httpBackend, projectsUrl, location, backendProject;

  // load the controller's module
  beforeEach(module('ncsaas'));

  // Initialize the controller and mocked backend
  beforeEach(inject(function($controller, $injector, $location, ENV) {
    location = $location;
    controller = $controller('ProjectsCtrl');

    $httpBackend = $injector.get('$httpBackend');

    projectsUrl = ENV.apiEndpoint + 'api/projects/';

    backendProject = {
      'url': 'http://127.0.0.1:8080/api/projects/6529589b43f741608139f85fd243de07/',
      'uuid': '6529589b43f741608139f85fd243de07',
      'name': 'Project EKppM',
      'customer': 'http://127.0.0.1:8080/api/customers/cbd39be4fda04cbeac80ea6a066da896/',
      'customer_name': 'Customer khUviUm',
      'customer_native_name': 'Native: Customer khUviUm',
      'customer_abbreviation': 'MLLyGP',
      'project_groups': [],
      'resource_quota': {
          'vcpu': 190,
          'ram': 197.0,
          'storage': 221184.0,
          'backup_storage': 144384.0,
          'max_instances': 224
      },
      'resource_quota_usage': {
          'backup_storage_usage': 144357.0,
          'ram_usage': 179.0,
          'storage_usage': 221135.0,
          'max_instances_usage': 198,
          'vcpu_usage': 177
      },
      'description': '',
      'clouds': [
          {
              'url': 'http://127.0.0.1:8080/api/clouds/25b15d223c44435db63f836d096735f5/',
              'name': 'CloudAccount of Customer khUviUm (jIr hDM ZKcPbhVh)'
          },
          {
              'url': 'http://127.0.0.1:8080/api/clouds/25b15d223c44435db63f836d096735f5/',
              'name': 'CloudAccount of Customer khUviUm (jIr hDM ZKcPbhVh)'
          }
      ]
    };

    }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('list() returns all projects', function() {
    $httpBackend.when('GET', projectsUrl).respond(200, [backendProject]);
    $httpBackend.expectPOST(projectsUrl);

    controller.list();

    $httpBackend.flush();
    expect(controller.projects).toBe([backendProject]);
  });

});
