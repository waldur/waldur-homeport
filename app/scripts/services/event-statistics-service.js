'use strict';

(function() {
  angular.module('ncsaas')
    .service('eventStatisticsService', ['baseServiceClass', eventStatisticsService]);

  function eventStatisticsService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/events/count/history/';
      }
    });
    return new ServiceClass();
  }

})();