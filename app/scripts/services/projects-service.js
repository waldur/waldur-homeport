'use strict';


(function () {
  angular.module('ncsaas')
    .service('projectsService', ['$q', '$http', 'baseServiceClass', 'ENV', projectsService]);

  function projectsService($q, $http, baseServiceClass, ENV) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/projects/';
      },
      getFirst: function() {
        var deferred = $q.defer();
        var savePageSize = this.pageSize;
        this.pageSize = 1;
        /*jshint camelcase: false */
        this.getList().then(function(projects) {
          deferred.resolve(projects[0]);
        });
        this.pageSize = savePageSize;

        return deferred.promise;
      },
      getCounters: function(query) {
        var query = angular.extend({operation: 'counters'}, query);
        return this.getFactory(false).get(query).$promise;
      },
      setThreshold: function(project_url, value) {
        return $http.post(ENV.apiEndpoint + 'api/price-estimates/threshold/', {
          threshold: value,
          scope: project_url
        });
      },
      setLimit: function(project_url, value) {
        return $http.post(ENV.apiEndpoint + 'api/price-estimates/limit/', {
          limit: value,
          scope: project_url
        });
      }
    });
    return new ServiceClass();
  }
})();
