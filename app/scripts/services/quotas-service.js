'use strict';

(function() {
  angular.module('ncsaas')
    .service('quotasService', ['baseServiceClass', quotasService]);

  function quotasService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/quotas/';
      },
      getHistory: function(url, start, end, points_count) {
        return this.getList({
          start: moment(start).unix(),
          end: moment(end).unix(),
          points_count: points_count
        }, url + 'history/');
      }
    });
    return new ServiceClass();
  }

})();