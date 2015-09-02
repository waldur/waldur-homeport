'use strict';

(function() {
  angular.module('ncsaas')
    .service('agreementsService', ['baseServiceClass', agreementsService]);

  function agreementsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/agreements/';
        this.filterByCustomer = false;
        this.executeOrder = this.operation.bind(this, 'execute');
      }
    });
    return new ServiceClass();
  }

})();
