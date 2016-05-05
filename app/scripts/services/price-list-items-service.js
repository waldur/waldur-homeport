'use strict';

(function() {
  angular.module('ncsaas')
    .service('priceListItemsService', ['baseServiceClass', priceListItemsService]);

  function priceListItemsService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/merged-price-list-items/';
      }
    });
    return new ServiceClass();
  }

})();