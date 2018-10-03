import customerThreshold from './customer-threshold';
import filtersModule from '../../core/filters';

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
    $provide.factory('priceEstimatesService', function($q) {
      return {
        isHardLimit: jasmine.createSpy('isHardLimit').and.returnValue(false),
        update: jasmine.createSpy('update').and.returnValue($q.when([])),
      };
    });
  }));

  let thresholdModel = {
    isHardLimit: false,
    priceEstimate: {
      limit: -1,
      total: 9,
      threshold: 10,
    }
  };
  let controller, scope, element, $compile, $rootScope;
  beforeEach(inject((_$rootScope_, _$compile_) => {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  let compileElement = function(thresholdModel) {
    scope = $rootScope.$new();
    scope.thresholdModel = thresholdModel;
    let html = '<customer-threshold model="thresholdModel"></customer-threshold>';
    element = angular.element(html);
    element = $compile(element)(scope);
    scope.$apply();
    controller = element.controller('customerThreshold');
  };

  it('does not show price estimate if total is not provided', () => {
    let model = angular.copy(thresholdModel);
    model.priceEstimate.total = null;
    compileElement(model);
    expect(element[0].querySelector('#priceEstimate')).toBeNull();
  });

  it('should display total price-estimate', () => {
    compileElement(thresholdModel);
    let priceEstimateElement = angular.element(element[0].querySelector('#priceEstimate'));
    expect(priceEstimateElement.text()).toBe('EUR9.00');
  });

  it('sets min error if threshold is less than 0', () => {
    let model = angular.copy(thresholdModel);
    model.priceEstimate.threshold = -1;
    compileElement(model);
    expect(controller.thresholdForm.threshold.$error.min).toBeTruthy();
  });

  it('sets exceedsThreshold error if threshold is less than total', () => {
    compileElement(thresholdModel);
    controller.thresholdForm.threshold.$setViewValue(thresholdModel.priceEstimate.total - 1);
    expect(controller.thresholdForm.threshold.$error.exceedsThreshold).toBeTruthy();
  });

  it('sets limit to -1 if isHardLimit is set to false', () => {
    controller.model.isHardLimit = false;
    controller.updateLimit();
    expect(thresholdModel.priceEstimate.limit).toBe(-1);
  });

  it('sets limit to threshold value if isHardLimit is toggled', () => {
    controller.model.isHardLimit = true;
    controller.updateLimit();
    expect(controller.model.priceEstimate.limit).toBe(controller.model.priceEstimate.threshold);
  });
});
