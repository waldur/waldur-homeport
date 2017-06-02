import customerPolicies from './customer-policies';
import filtersModule from '../core/filters';

describe('Customer policies', () => {

  function initModule(module) {
    module.component('customerPolicies', customerPolicies);
    module.constant('ENV', {
      apiEndpoint: 'https://example.com/',
      currency: 'EUR',
    });
    filtersModule(module);
  }
  initModule(angular.module('customerPoliciesModule', ['ngResource', 'ui.router', 'pascalprecht.translate']));
  beforeEach(angular.mock.module('customerPoliciesModule'));

  beforeEach(angular.mock.module(function($provide) {
    $provide.factory('customerUtils', function($q) {
      return {
        isHardLimit: jasmine.createSpy('isHardLimit').and.returnValue(false),
        saveLimit: jasmine.createSpy('saveLimit').and.returnValue($q.when([])),
        saveThreshold: jasmine.createSpy('saveThreshold').and.returnValue($q.when([]))
      };
    });
    $provide.factory('ncUtilsFlash', function() {
      return {
      };
    });
  }));

  let customerUtils;
  let $rootScope;
  let controller, scope, element;
  let customer = {
    url: 'api/fake/customer/1',
  };
  beforeEach(inject((_customerUtils_, _$rootScope_, $compile) => {
    customerUtils = _customerUtils_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    let html = '<customer-policies customer="customer"></customer-policies>';
    element = angular.element(html);
    scope.customer = customer;
    element = $compile(element)(scope);
    scope.$apply();
    controller = element.controller('customerPolicies');
  }));

  it('updatePolicies calls priceEstimates service with customer url and a customer threshold', () => {
    controller.updatePolicies();
    expect(customerUtils.saveLimit).toHaveBeenCalledWith(
      false, customer
    );
    expect(customerUtils.saveThreshold).toHaveBeenCalledWith(
      customer
    );
  });

  it('updatePolicies send -1 to setLimit in price estimate service if hard limit is false', () => {
    controller.isHardLimit = false;
    controller.updatePolicies();
    expect(customerUtils.saveLimit).toHaveBeenCalledWith(
      false, customer
    );
    expect(customerUtils.saveThreshold).toHaveBeenCalledWith(
      customer
    );
  });
});
