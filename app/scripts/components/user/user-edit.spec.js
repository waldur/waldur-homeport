import { userEdit } from './user-edit';
import coreModule from '../core/module';
import userFilterModule from './filters';

describe('User edit', () => {

  function initModule(module) {
    module.service('$uibModal', function(){});
    module.component('userEdit', userEdit);
    module.constant('ENV', {
      userMandatoryFields: [
        'full_name',
        'email',
      ],
    });
    coreModule(module);
    userFilterModule(module);
  }

  let user = {
    full_name: 'Tomy Branko',
    token_lifetime: 3600,
  };

  initModule(angular.module('userEditModule', ['ngResource', 'ui.router', 'pascalprecht.translate']));
  beforeEach(angular.mock.module('userEditModule'));

  beforeEach(angular.mock.module(function($provide) {
    $provide.factory('usersService', function($q) {
      return {
        getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue($q.when(user))
      };
    });
  }));

  let $rootScope, $compile, element, scope;

  beforeEach(inject(function(_$rootScope_, _$compile_){
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  let compileElement = (user) => {
    scope = $rootScope.$new();
    scope.user = user;
    let html = '<user-edit user="user" errors="errors" on-save="save($event)" initial="true"></user-edit>';
    element = angular.element(html);
    element = $compile(element)(scope);
    scope.$apply();
    return element.controller('userEdit');
  };

  it('User form with all required field is valid', () => {
    let controller = compileElement(user);
    controller.UserForm.full_name.$setViewValue('Tomy Branko');
    controller.UserForm.email.$setViewValue('tomy.branko@example.com');
    expect(controller.UserForm.$valid).toBeTruthy();
  });

  it('User form with empty required field is not valid', () => {
    let controller = compileElement(user);
    controller.UserForm.full_name.$setViewValue('Tomy Branko');
    controller.UserForm.email.$setViewValue('');
    expect(controller.UserForm.$valid).toBeFalsy();
  });
});
