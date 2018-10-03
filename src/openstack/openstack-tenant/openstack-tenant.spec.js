import OpenStackTenantConfig from './openstack-tenant-config';
import AppstoreResourceLoader from '../../appstore/appstore-resource-loader';
import coreModule from '../../core/module';

describe('OpenStack Tenant Provision Form', function() {

  function initModule(module) {
    module.service('$uibModal', function(){});
    module.service('$uibModalStack', function(){});
    module.service('AppstoreResourceLoader', AppstoreResourceLoader);
    module.constant('ENV', {
      apiEndpoint: 'https://example.com/'
    });
    coreModule(module);
  }

  initModule(angular.module('openstack-tenant-config', ['ngResource', 'ui.router']));
  beforeEach(angular.mock.module('openstack-tenant-config'));

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

  it('loads package templates filtered by settings', () => {
    loader.loadValidChoices({
      settings_uuid: 'VALID_SETTINGS_UUID'
    }, OpenStackTenantConfig.options);

    $rootScope.$digest();

    expect(servicesService.getAll).toHaveBeenCalledWith({
      service_settings_uuid: 'VALID_SETTINGS_UUID',
      archived: 'False',
    }, 'https://example.com/api/package-templates/');
  });
});
