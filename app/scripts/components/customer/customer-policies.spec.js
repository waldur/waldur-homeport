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
  initModule(angular.module('ncsass', ['ngResource', 'ui.router', 'pascalprecht.translate']));
  beforeEach(angular.mock.module('ncsass'));

  beforeEach(angular.mock.module(function($provide) {
    $provide.factory('priceEstimatesService', function($q) {
      return {
        setLimit: jasmine.createSpy('setLimit').and.returnValue($q.when([])),
        setThreshold: jasmine.createSpy('setThreshold').and.returnValue($q.when([]))
      };
    });
    $provide.factory('ncUtilsFlash', function() {
      return {
      };
    });
  }));

  let priceEstimatesService;
  let $rootScope;
  let controller, scope, element;
  let customer = {
    url: 'api/fake/customer/1',
    price_estimate: {
      threshold: 10,
      total: 11,
      limit: 10,
    }
  };
  beforeEach(inject((_priceEstimatesService_, _$rootScope_, $compile) => {
    priceEstimatesService = _priceEstimatesService_;
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
    expect(priceEstimatesService.setLimit).toHaveBeenCalledWith(
      customer.url, customer.price_estimate.threshold
    );
    expect(priceEstimatesService.setThreshold).toHaveBeenCalledWith(
      customer.url, customer.price_estimate.threshold
    );
  });

  it('updatePolicies send -1 to setLimit in price estimate service if hard limit is false', () => {
    controller.isHardLimit = false;
    controller.updatePolicies();
    expect(priceEstimatesService.setLimit).toHaveBeenCalledWith(
      customer.url, -1
    );
    expect(priceEstimatesService.setThreshold).toHaveBeenCalledWith(
      customer.url, customer.price_estimate.threshold
    );
  });

  it('should display total price-estimate', () => {
    let priceEstimateElement = angular.element(element[0].querySelector('#price-estimate'));
    expect(priceEstimateElement.text()).toBe('EUR11.00');
  });

  it('should set form to invalid state if threshold is less than 0', () => {
    controller.policiesForm.threshold.$setViewValue(-1);
    expect(controller.policiesForm.threshold.$valid).toBeFalsy();
  });

  it('should check hard limit checkbox if threshold is less than total', () => {
    let el = angular.element(element[0].querySelector('#isHardLimit'));
    expect(el.val()).toBe('on');
  });

  it('should set form to invalid state if threshold is less than total', () => {
    controller.policiesForm.threshold.$setViewValue(4);
    expect(controller.policiesForm.threshold.$valid).toBeFalsy();
  });
});
