import appstoreFieldList from './appstore-field-list';

describe('Appstore field list', () => {
  const API_ENDPOINT = 'https://example.com/';

  function initModule(module) {
    module.directive('appstoreFieldList', appstoreFieldList);
  }

  initModule(
    angular.module('appstoreFieldListModule', ['ngResource', 'ui.router']),
  );
  beforeEach(angular.mock.module('appstoreFieldListModule'));

  beforeEach(
    angular.mock.module(function($provide) {
      $provide.factory('$uibModal', function() {
        return {};
      });
      $provide.service('$uibModalStack', function() {});
      $provide.factory('coreUtils', function() {
        return {
          templateFormatter: jasmine.createSpy('templateFormatter'),
        };
      });
    }),
  );

  let field = {
    choices: [
      {
        fingerprint: 'e3:77:8f:90:cd:3f:6f:61:61:f2:f8:4b:cc:f8:1f:44',
        name: 'my-key',
        public_key:
          'ssh-rsa brd1oBjTIfE1Hou0K7wKa1GHJhD+HmYmmV test@example.com',
        url: `${API_ENDPOINT}/api/keys/b5c7b66ffc6c419090557391c90dfff4/`,
        user_uuid: 'a8ed784de4474284a6088261537a6430',
        uuid: 'b5c7b66ffc6c419090557391c90dfff4',
      },
    ],
    columns: [
      {
        label: 'Name',
        name: 'name',
      },
      {
        label: 'Fingerprint',
        name: 'fingerprint',
      },
    ],
    emptyMessage:
      'You have not added any SSH keys to your <a ui-sref="profile.keys">profile</a>.',
    label: 'SSH public key',
    name: 'ssh_public_key',
    preselectFirst: true,
    type: 'list',
  };
  let model = {};
  let $rootScope, $compile;
  beforeEach(inject((_$rootScope_, _$compile_) => {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  function compileElement(field) {
    let scope = $rootScope.$new();
    scope.field = field;
    scope.model = model;
    let html =
      '<appstore-field-list field="field" model="model"></appstore-field-list>';
    let element = angular.element(html);
    element = $compile(element)(scope);
    let controller = element.controller('appstoreFieldList');
    scope.$apply();
    return {
      controller: controller,
      element: element,
    };
  }

  it('preselects SSH key if exactly one key is configured', () => {
    let compiled = compileElement(field);
    let controller = compiled.controller;
    let element = compiled.element;

    expect(controller.model[field.name]).toBe(field.choices[0]);
    expect(controller.renderEmpty).toBeFalsy();
    expect(controller.renderWarning).toBeFalsy();
    expect(controller.hasChoices).toBeTruthy();
    expect(element.text().trim()).toBe(field.choices[0].name);
  });

  it('sets renderEmpty to True if field has no choices', () => {
    field.choices = [];
    let controller = compileElement(field).controller;

    expect(controller.emptyMessage).toBe(field.emptyMessage);
    expect(controller.renderEmpty).toBeTruthy();
    expect(controller.renderWarning).toBeFalsy();
  });

  it('sets renderWarning to True if field has is required and has no choices', () => {
    field.choices = [];
    field.required = true;
    let controller = compileElement(field).controller;

    expect(controller.warningMessage).toBe(field.warningMessage);
    expect(controller.renderWarning).toBeTruthy();
    expect(controller.renderEmpty).toBeFalsy();
  });
});
