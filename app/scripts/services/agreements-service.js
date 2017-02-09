'use strict';

(function() {
  angular.module('ncsaas')
    .service('agreementsService', ['baseServiceClass', '$http', 'ENV', agreementsService]);

  function agreementsService(baseServiceClass, $http, ENV) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/agreements/';
      },
      approve: function(agreement) {
        return $http.post(ENV.apiEndpoint + 'api/agreements/approve/', agreement);
      },
      cancel: function(agreement) {
        return $http.post(ENV.apiEndpoint + 'api/agreements/cancel/', agreement);
      }
    });
    return new ServiceClass();
  }

})();
