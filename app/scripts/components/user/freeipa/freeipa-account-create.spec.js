import freeipaAccountCreate from './freeipa-account-create';
import filtersModule from '../../core/filters';

describe('FreeIPA account create', () => {

  function initModule(module) {
    module.component('freeipaAccountCreate', freeipaAccountCreate);
    module.constant('ENV', {
      apiEndpoint: 'https://example.com/',
      currency: 'EUR',
    });
    filtersModule(module);
  }
  initModule(angular.module('freeipaAccountCreateModule', ['ngResource', 'ui.router', 'pascalprecht.translate']));
  beforeEach(angular.mock.module('freeipaAccountCreateModule'));

  beforeEach(angular.mock.module(function($provide) {
    $provide.factory('freeipaService', function($q) {
      return {
        createProfile: jasmine.createSpy('createProfile').and.returnValue($q.when([])),
      };
    });
    $provide.factory('ncUtilsFlash', function() {
      return {
        success: jasmine.createSpy('success'),
      };
    });
  }));

  let freeipaService;
  let $rootScope;
  let controller, scope, element;
  let profile = {
    username: 'username',
    acceptPolicy: true,
  };
  beforeEach(inject((_freeipaService_, _$rootScope_, $compile) => {
    freeipaService = _freeipaService_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    let html = '<freeipa-account-create ></freeipa-account-create>';
    element = angular.element(html);
    element = $compile(element)(scope);
    scope.$apply();
    controller = element.controller('freeipaAccountCreate');
  }));

  it('submitForm calls freeipaService service', () => {
    controller.profileForm.username.$setViewValue(profile.username);
    controller.profileForm.acceptPolicy.$setViewValue(profile.acceptPolicy);
    controller.submitForm();
    expect(freeipaService.createProfile).toHaveBeenCalledWith(profile.username, profile.acceptPolicy);
  });

  it('submitForm does not call freeipaService service username is empty', () => {
    controller.profileForm.username.$setViewValue('');
    controller.profileForm.acceptPolicy.$setViewValue(profile.acceptPolicy);
    controller.submitForm();
    expect(freeipaService.createProfile).not.toHaveBeenCalled();
  });
});
