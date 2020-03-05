import freeipaAccountCreate from './freeipa-account-create';
import filtersModule from '../core/filters';

describe('FreeIPA account create', () => {
  function initModule(module) {
    module.component('freeipaAccountCreate', freeipaAccountCreate);
    module.constant('ENV', {
      apiEndpoint: 'https://example.com/',
      FREEIPA_USERNAME_PREFIX: 'waldur_',
    });
    filtersModule(module);
  }
  initModule(
    angular.module('freeipaAccountCreateModule', [
      'ngResource',
      'ui.router',
      'pascalprecht.translate',
    ]),
  );
  beforeEach(angular.mock.module('freeipaAccountCreateModule'));

  beforeEach(
    angular.mock.module(function($provide) {
      $provide.factory('freeipaService', function($q) {
        return {
          createProfile: jasmine
            .createSpy('createProfile')
            .and.returnValue($q.when([])),
        };
      });
      $provide.factory('ncUtilsFlash', function() {
        return {
          success: jasmine.createSpy('success'),
        };
      });
      $provide.factory('usersService', function($q) {
        return {
          getCurrentUser: jasmine.createSpy('createProfile').and.returnValue(
            $q.when({
              username: 'admin',
            }),
          ),
        };
      });
    }),
  );

  let freeipaService;
  let $rootScope;
  let controller, scope, element;

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

  it('submitForm calls backend if form is valid', () => {
    controller.profileForm.username.$setViewValue('username');
    controller.profileForm.acceptPolicy.$setViewValue(true);
    expect(controller.profileForm.$valid).toBeTruthy();
    controller.submitForm();
    expect(freeipaService.createProfile).toHaveBeenCalledWith('username', true);
  });

  it('submitForm does not call backend if form is invalid', () => {
    controller.profileForm.username.$setViewValue('invalid username');
    controller.profileForm.acceptPolicy.$setViewValue(true);
    expect(controller.profileForm.$invalid).toBeTruthy();
    controller.submitForm();
    expect(freeipaService.createProfile).not.toHaveBeenCalled();
  });

  it('submitForm does not call backend if form is user has not accepted agreement', () => {
    controller.profileForm.username.$setViewValue('invalid username');
    controller.profileForm.acceptPolicy.$setViewValue(false);
    expect(controller.profileForm.$invalid).toBeTruthy();
    controller.submitForm();
    expect(freeipaService.createProfile).not.toHaveBeenCalled();
  });

  it('form is invalid if username is empty', () => {
    controller.profileForm.username.$setViewValue('');
    controller.profileForm.acceptPolicy.$setViewValue(true);
    controller.submitForm();
    expect(controller.profileForm.username.$error.required).toBeTruthy();
  });

  it('form is invalid if username contains invalid sign', () => {
    controller.profileForm.username.$setViewValue('@');
    controller.profileForm.acceptPolicy.$setViewValue(true);
    controller.submitForm();
    expect(controller.profileForm.username.$error.pattern).toBeTruthy();
  });

  it('form is invalid if username is too long', () => {
    controller.profileForm.username.$setViewValue(Array(255).join('a'));
    controller.profileForm.acceptPolicy.$setViewValue(true);
    controller.submitForm();
    expect(controller.profileForm.username.$error.maxlength).toBeTruthy();
  });
});
