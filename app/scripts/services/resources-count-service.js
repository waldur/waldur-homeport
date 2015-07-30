'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesCountService', ['$http', '$q', 'ENV', resourcesCountService]);

  function resourcesCountService($http, $q, ENV) {
    function factory(endpoint) {
      return function(params) {
        var deferred = $q.defer();

        var url = ENV.apiEndpoint + 'api/' + endpoint + '/'
        $http.head(url, {'params': params}).success(function(data, status, header) {
          deferred.resolve(parseInt(header()['x-result-count']));
        }).error(function() {
          deferred.reject();
        })
        return deferred.promise;
      }
    }
    return {
      'resources': factory('resources'),
      'backups': factory('backups'),
      'users': factory('project-permissions'),
      'alerts': factory('alerts'),
    }
  }
})();
