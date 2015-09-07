'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesCountService', ['$http', '$q', 'ENV', 'resourcesService', resourcesCountService]);

  function resourcesCountService($http, $q, ENV, resourcesService) {
    function factory(endpoint) {
      return function(params) {
        var deferred = $q.defer();

        var url = ENV.apiEndpoint + 'api/' + endpoint + '/';
        var cacheKey = url + JSON.stringify(params) + 'x-result-count';
        var cache = resourcesService.getCache(cacheKey);
        if (cache && cache.time > new Date().getTime()) {
          deferred.resolve(cache.data);
        } else {
          $http.head(url, {'params': params}).success(function(data, status, header) {
            var count = parseInt(header()['x-result-count']);
            resourcesService.setCache(ENV.countsCacheTime, count, cacheKey, '/' + endpoint + '/');
            deferred.resolve(count);
          }).error(function() {
            deferred.reject();
          });
        }
        return deferred.promise;
      }
    }
    return {
      'resources': factory('resources'),
      'backups': factory('backups'),
      'users': factory('project-permissions'),
      'alerts': factory('alerts'),
      'events': factory('events'),
      'projectCloud': factory('project-cloud-memberships'),
      'projects': factory('projects'),
      'digitalocean': factory('digitalocean'),
      'clouds': factory('clouds'),
      'project-cloud-memberships': factory('project-cloud-memberships'),
      'digitalocean-service-project-link': factory('digitalocean-service-project-link'),
      'services': factory('service-items'),
      'aws-service-project-link': factory('aws-service-project-link')
    }
  }
})();
