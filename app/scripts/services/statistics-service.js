'use strict';

(function() {
  angular.module('ncsaas')
    .service('statisticsService', ['baseServiceClass', statisticsService]);

  function statisticsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/stats/';
      }
    });
    return new ServiceClass();
  }

})();


(function() {
  angular.module('ncsaas').constant('STATTYPEENDPOINT', {
    creationTime: 'creation-time'
  })
})();
