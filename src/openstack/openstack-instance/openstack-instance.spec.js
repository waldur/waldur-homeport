import OpenStackInstanceConfig from './openstack-instance-config';
import AppstoreResourceLoader from '../../appstore/appstore-resource-loader';
import coreModule from '../../core/module';

describe('OpenStack Instance Provision Form', function() {

  function initModule(module) {
    module.service('$uibModal', function(){});
    module.service('$uibModalStack', function(){});
    module.service('AppstoreResourceLoader', AppstoreResourceLoader);
    module.constant('ENV', {
      apiEndpoint: 'https://example.com/'
    });
    coreModule(module);
  }

  initModule(angular.module('openstack-instance-config', ['ngResource', 'ui.router']));
  beforeEach(angular.mock.module('openstack-instance-config'));

  beforeEach(angular.mock.module(function($provide) {
    $provide.factory('servicesService', function($q) {
      return {
        getAll: jasmine.createSpy('getAll').and.returnValue($q.when([]))
      };
    });
  }));

  let loader;
  let $rootScope;
  let servicesService;
  beforeEach(inject(function(_AppstoreResourceLoader_, _$rootScope_, _servicesService_) {
    loader = _AppstoreResourceLoader_;
    $rootScope = _$rootScope_;
    servicesService = _servicesService_;
  }));

  it('loads security groups, subnets and floating IPs filtered by settings', () => {
    loader.loadValidChoices({
      settings_uuid: 'VALID_SETTINGS_UUID'
    }, OpenStackInstanceConfig.options);

    $rootScope.$digest();

    expect(servicesService.getAll).toHaveBeenCalledWith({
      settings_uuid: 'VALID_SETTINGS_UUID'
    }, 'https://example.com/api/openstacktenant-security-groups/');

    expect(servicesService.getAll).toHaveBeenCalledWith({
      settings_uuid: 'VALID_SETTINGS_UUID'
    }, 'https://example.com/api/openstacktenant-subnets/');

    expect(servicesService.getAll).toHaveBeenCalledWith({
      settings_uuid: 'VALID_SETTINGS_UUID',
      is_booked: 'False',
      runtime_state: 'DOWN',
      free: 'True',
    }, 'https://example.com/api/openstacktenant-floating-ips/');
  });
});
