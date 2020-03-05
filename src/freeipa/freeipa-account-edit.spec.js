import freeipaAccountEdit from './freeipa-account-edit';
import filtersModule from '../core/filters';

describe('FreeIPA account edit', () => {
  function initModule(module) {
    module.component('freeipaAccountEdit', freeipaAccountEdit);
    module.constant('ENV', {
      apiEndpoint: 'https://example.com/',
    });
    filtersModule(module);
  }
  initModule(
    angular.module('freeipaAccountEditModule', [
      'ngResource',
      'ui.router',
      'pascalprecht.translate',
    ]),
  );
  beforeEach(angular.mock.module('freeipaAccountEditModule'));

  beforeEach(
    angular.mock.module(function($provide) {
      $provide.factory('freeipaService', function($q) {
        return {
          enableProfile: jasmine
            .createSpy('enableProfile')
            .and.returnValue($q.when([])),
          disableProfile: jasmine
            .createSpy('disableProfile')
            .and.returnValue($q.when([])),
          syncProfile: jasmine
            .createSpy('syncProfile')
            .and.returnValue($q.when([])),
        };
      });
      $provide.factory('ncUtilsFlash', function() {
        return {
          success: jasmine.createSpy('success'),
        };
      });
    }),
  );

  let freeipaService;
  let $rootScope;
  let controller, scope, element;
  let profile = {
    uuid: 123,
    username: 'johndoe',
    is_active: false,
  };
  beforeEach(inject((_freeipaService_, _$rootScope_, $compile) => {
    freeipaService = _freeipaService_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    let html =
      '<freeipa-account-edit profile="profile"></freeipa-account-edit>';
    element = angular.element(html);
    scope.profile = profile;
    element = $compile(element)(scope);
    scope.$apply();
    controller = element.controller('freeipaAccountEdit');
  }));

  it('enableProfile calls freeipaService service with profile uuid', () => {
    controller.enableProfile();
    expect(freeipaService.enableProfile).toHaveBeenCalledWith(profile.uuid);
  });

  it('disableProfile calls freeipaService service with profile uuid', () => {
    controller.disableProfile();
    expect(freeipaService.disableProfile).toHaveBeenCalledWith(profile.uuid);
  });

  it('syncProfile calls freeipaService service with profile uuid', () => {
    controller.syncProfile();
    expect(freeipaService.syncProfile).toHaveBeenCalledWith(profile.uuid);
  });
});
