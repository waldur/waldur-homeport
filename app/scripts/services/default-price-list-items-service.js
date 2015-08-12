'use strict';

(function() {
  angular.module('ncsaas')
    .service('defaultPriceListItemsService', ['baseServiceClass', defaultPriceListItemsService]);

  function defaultPriceListItemsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/default-price-list-items/';
      }
    });
    return new ServiceClass();
  }

})();
