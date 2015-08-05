'use strict';

(function() {
  angular.module('ncsaas')
    .service('hooksService', ['$http', '$q', 'ENV', hooksService]);

  function hooksService($http, $q, ENV) {
    var endpoints = {
      'email': '/hooks-email/',
      'web': '/hooks-web/',
    };

    function getListUrl(type) {
      var endpoint = endpoints[type];
      return ENV.apiEndpoint + 'api' + endpoint;
    }

    function getDetailUrl(type, uuid) {
      return getListUrl(type) + uuid + '/';;
    }

    function flattenList(items) {
      var result = [];
      for (var i = 0; i < items.length; i++) {
        for (var j = 0; j < items[i].length; j++) {
          result.push(items[i][j]);
        }
      }
      return result;
    }

    function annotate(item) {
      for (var type in endpoints) {
        if (item.url.indexOf(endpoints[type]) != -1) {
          item.$type = type;
        }
      };
    }

    function initResource(resource) {
      resource.$save = function(success, error) {
        var data = {};
        for(var key in resource) {
          if (key.charAt(0) != '$') {
            data[key] = resource[key];
          }
        }
        var url = getListUrl(resource.$type);
        $http.post(url, data).success(success).error(error);
      }

      resource.$delete = function(success, error) {
        var url = getDetailUrl(resource.$type, resource.uuid);
        $http.delete(url).success(success).error(error);
      }

      resource.$update = function(success, error) {
        var url = getDetailUrl(resource.$type, resource.uuid);
        $http.put(url, resource).success(success).error(error);
      }
    }

    return {
      getList: function(filter) {
        var promises = [];
        for (var type in endpoints) {
          var promise = $http.get(getListUrl(type)).then(function(response){
            return response.data;
          })
          promises.push(promise);
        };
        var deferred = $q.defer();
        $q.all(promises).then(function(responses) {
          var items = flattenList(responses);
          angular.forEach(items, annotate);
          angular.forEach(items, initResource);
          deferred.resolve(items);
        }, function(){
          deferred.reject();
        });
        return deferred.promise;
      },

      $create: function() {
        var resource = {};
        initResource(resource)
        return resource;
      }
    }
  }
})();