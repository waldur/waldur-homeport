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
        setLimit: jasmine.createSpy('setLimit').and.returnValue($q.when([]))
      };
    });
    $provide.factory('ncUtilsFlash', function() {
      return {
      };
    });
  }));

  let priceEstimatesService;
  let $rootScope;
  let ENV;
  beforeEach(inject((_priceEstimatesService_, _$rootScope_, _ENV_) => {
    priceEstimatesService = _priceEstimatesService_;
    $rootScope = _$rootScope_;
    ENV = _ENV_;
  }));

  describe('controller', () => {
    let controller;
    let customer = {
      url: 'api/fake/customer/1',
      price_estimate: {
        threshold: 10,
        total: 11,
      }
    };

    beforeEach(inject((_$componentController_, _$q_) => {
      let bindings = {
        customer: customer,
        isHardLimit: true,
      };
      let scope = $rootScope.$new();
      controller = _$componentController_('customerPolicies', {$scope: scope}, bindings);
      controller.policiesForm = {
        threshold: {
          $setValidity: jasmine.createSpy('$setValidity').and.returnValue(_$q_.when([]))
        }
      };
    }));

    it('saveLimit calls priceEstimates service with customer url and a customer threshold', () => {
      controller.saveLimit();
      expect(priceEstimatesService.setLimit).toHaveBeenCalledWith(
        customer.url, customer.price_estimate.threshold
      );
    });

    it('sets invalid threshold on customer policies form if threshold is less than a total', () => {
      controller.validateThreshold();
      expect(controller.policiesForm.threshold.$setValidity).toHaveBeenCalledWith('exceedsThreshold', false);
    });
  });

  describe('component', () => {
    let scope;
    let element;
    beforeEach(inject(($compile) => {
      scope = $rootScope.$new();
      let html = '<customer-policies customer="customer" is-hard-limit="isHardLimit"></customer-policies>';
      element = angular.element(html);
      scope.isHardLimit = true;
      scope.customer = {
        url: 'api/fake/customer/1',
        price_estimate: {
          threshold: 10,
          total: 11,
        }
      };
      scope.updatePolicies = jasmine.createSpy('updatePolicies');
      element = $compile(element)(scope);
      scope.$apply();
    }));

    it('should display total price-estimate', () => {
      let priceEstimateElement = angular.element(element[0].querySelector('#price-estimate'));
      let expectedResult = '{0}{1}.00'.replace('{0}', ENV.currency).replace('{1}',scope.customer.price_estimate.total);
      expect(priceEstimateElement.text()).toBe(expectedResult);
    });
  });
});
