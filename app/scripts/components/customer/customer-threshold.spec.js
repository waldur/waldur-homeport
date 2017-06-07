import customerThreshold from './customer-threshold';
import filtersModule from '../core/filters';

describe('customerThreshold', () => {

  function initModule(module) {
    module.component('customerThreshold', customerThreshold);
    module.constant('ENV', {
      currency: 'EUR',
    });
    filtersModule(module);
  }
  initModule(angular.module('customerThresholdModule', ['ngResource', 'ui.router', 'pascalprecht.translate']));
  beforeEach(angular.mock.module('customerThresholdModule'));

  beforeEach(angular.mock.module(function($provide) {
    $provide.factory('customerUtils', function($q) {
      return {
        isHardLimit: jasmine.createSpy('isHardLimit').and.returnValue(false),
        saveLimit: jasmine.createSpy('saveLimit').and.returnValue($q.when([])),
        saveThreshold: jasmine.createSpy('saveThreshold').and.returnValue($q.when([]))
      };
    });
  }));

  let priceEstimate = {
    limit: -1,
    total: 9,
    threshold: 10,
  };
  let controller, scope, element, $compile, $rootScope;
  beforeEach(inject((_$rootScope_, _$compile_) => {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  let compileElement = function(priceEstimate) {
    scope = $rootScope.$new();
    scope.priceEstimate = priceEstimate;
    let html = '<customer-threshold price-estimate="priceEstimate"></customer-threshold>';
    element = angular.element(html);
    element = $compile(element)(scope);
    scope.$apply();
    controller = element.controller('customerThreshold');
  };

  it('does not show price estimate if total is not provided', () => {
    let estimate = angular.copy(priceEstimate);
    estimate.total = null;
    compileElement(estimate);
    expect(element[0].querySelector('#priceEstimate')).toBeNull();
  });

  it('should display total price-estimate', () => {
    compileElement(priceEstimate);
    let priceEstimateElement = angular.element(element[0].querySelector('#priceEstimate'));
    expect(priceEstimateElement.text()).toBe('EUR9.00');
  });

  it('sets min error if threshold is less than 0', () => {
    let estimate = angular.copy(priceEstimate);
    estimate.threshold = -1;
    compileElement(estimate);
    expect(controller.thresholdForm.threshold.$error.min).toBeTruthy();
  });

  it('sets exceedsThreshold error if threshold is less than total', () => {
    compileElement(priceEstimate);
    controller.thresholdForm.threshold.$setViewValue(priceEstimate.total - 1);
    expect(controller.thresholdForm.threshold.$error.exceedsThreshold).toBeTruthy();
  });
});
