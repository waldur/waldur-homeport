'use strict';

(function() {
  angular.module('ncsaas')
    .service('priceEstimationService', ['baseServiceClass', priceEstimationService]);

  function priceEstimationService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/price-estimates/';
      }
    });
    return new ServiceClass();
  }

})();