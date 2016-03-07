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
      }
    });
    return new ServiceClass();
  }

})();
