// jscs:disable
(function(){

  /**
   * Base service class for services with pagination
   *   getList
   *   $get
   *   $delete
   *   $create
   *   operation
   */

  angular.module('ncsaas')
    .service('baseServiceClass', [
      '$q', 'currentStateService', '$resource', 'ENV', '$rootScope', 'listCache', baseServiceClass]);
  function baseServiceClass($q, currentStateService, $resource, ENV, $rootScope, listCache) {
    // pageSize, page, pages - default variables, you can change this in your init method or call this._super() in init
    var BaseServiceClass = Class.extend({
      ALL_CACHE_KEYS: 'ALL_CACHE_KEYS',
      pageSize:null,
      page:null,
      pages:null,
      resultCount:null,
      currentStateService:null,
      endpoint:null,
      filterByCustomer: true,
      customerUuid:null,
      cacheTime: 0,
      cacheReset: false,
      endpointPostfix: '',

      init:function() {
        this.pageSize = ENV.pageSize;
        this.page = 1;
        this.pages = null;
        this.defaultFilter = {};
        this.currentStateService = currentStateService;
        this.pageChangingReset();
        this.cacheTime = 0;
      },

      getList:function(filter, endpointUrl) {
        var vm = this;
        var deferred = $q.defer();
        filter = filter || {};
        for (var key in this.defaultFilter) {
          filter[key] = this.defaultFilter[key];
        }
        var queryList = function() {
          filter.page = vm.page;
          /*jshint camelcase: false */
          filter.page_size = vm.pageSize;
          var cacheKey = vm.endpoint + JSON.stringify(filter);
          var cache = vm.getCache(cacheKey);

          if (!vm.cacheReset && vm.cacheTime > 0 && cache && cache.time > new Date().getTime()) {
            vm.setPagesCount(cache.count);
            deferred.resolve(cache.data);
          } else {
            vm.cacheReset = false;
            listCache.put(cacheKey, {data: null, time: 0});
            vm.getFactory(true, null, endpointUrl).query(filter, function(response, responseHeaders) {
              var header = responseHeaders();
              var resultCount = !header['x-result-count'] ? null : header['x-result-count'];
              vm.setPagesCount(resultCount);
              if (vm.cacheTime > 0) {
                vm.setCache(vm.cacheTime, response, cacheKey, vm.endpoint);
              }
              deferred.resolve(response);
            }, function(err) {
              if (err.status === 401) {
                $rootScope.$broadcast('authService:signout');
              }
              deferred.reject(err);
            });
          }

        };

        if (vm.currentStateService == null || !vm.filterByCustomer) {
          queryList();
        } else {
          vm.currentStateService.getCustomer().then(function (response) {
            /*jshint camelcase: false */
            filter.customer = (this.customerUuid) ? this.customerUuid() : response.uuid;
            queryList();
          }, function (err) {
            deferred.reject(err);
          });
        }

        return deferred.promise;
      },
      setCache: function(time, response, cacheKey, endpoint) {
        var allCacheKeys = listCache.get(this.ALL_CACHE_KEYS) ? listCache.get(this.ALL_CACHE_KEYS) : {};
        var keysForCurrentEndpoint = allCacheKeys[endpoint] ? allCacheKeys[endpoint] : [];
        if (keysForCurrentEndpoint.indexOf(cacheKey) == -1) {
          keysForCurrentEndpoint.push(cacheKey);
          allCacheKeys[endpoint] = keysForCurrentEndpoint;
          listCache.put(this.ALL_CACHE_KEYS, allCacheKeys);
        }
        var cacheTime = new Date().getTime() + (time * 1000);
        listCache.put(cacheKey, {data: response, time: cacheTime, count: this.resultCount});
      },
      getCache: function(cacheKey) {
        return listCache.get(cacheKey);
      },
      setPagesCount: function(count) {
        if (count) {
          this.resultCount = count;
          this.pages = Math.ceil(this.resultCount/this.pageSize);
          this.sliceStart = (this.page - 1) * this.pageSize + 1;
          this.sliceEnd = Math.min(this.resultCount, this.page * this.pageSize)
        }
      },
      clearAllCacheForCurrentEndpoint: function() {
        var allKeys = listCache.get(this.ALL_CACHE_KEYS);
        var currentKeys = allKeys[this.endpoint];
        if (currentKeys) {
          for (var i = 0; i < currentKeys.length; i++) {
            listCache.remove(currentKeys[i]);
          }
        }
      },
      $create:function(endpointUrl) {
        var Instance = this.getFactory(false, null, endpointUrl);
        return new Instance();
      },

      $delete:function(uuid) {
        var deferred = $q.defer();
        this.getFactory(false).remove({}, {uuid: uuid}).$promise.then(function(response) {
          deferred.resolve(response);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },

      /**
       * Use this function if you need to remove some entity by full endPoint url
       *
       * @param url     string   endPoint url
       * @return promise
       */
      $deleteByUrl: function(url) {
        return this.getFactory(false, null, url).delete().$promise;
      },

      operation:function(operation, uuid, inputs) {
        var deferred = $q.defer(),
          parameters = {
            uuid: uuid,
            operation: operation
          };
        for (var inputName in inputs) {
          parameters[inputName] = inputs[inputName];
        }
        this.getFactory(false).operation(parameters).$promise.then(function(response){
          deferred.resolve(response);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },

      getFactory:function(isList, endpoint, endpointUrl) {
        endpoint = endpoint || this.getEndpoint(isList);
        endpointUrl = endpointUrl || ENV.apiEndpoint + 'api' + endpoint;
        /*jshint camelcase: false */
        return $resource(endpointUrl + ':UUID/:operation/', {UUID:'@uuid',
            page_size:'@page_size', page:'@page', 'DONTBLOCK': '@DONTBLOCK', operation:'@operation'},
          {
            operation: {
              method:'POST',
              url:ENV.apiEndpoint + 'api' + endpoint + ':UUID/:operation/',
              params: {UUID:'@uuid', operation:'@operation'}
            },
            update: {
              method: 'PUT'
            },
            options: {
              method: 'OPTIONS'
            }
          }
        );
      },

      $update: function(uuid, url, fields) {
        var modelObject = JSON.parse(JSON.stringify(fields));
        if (url) {
          delete modelObject.uuid;
        } else {
          modelObject.uuid = uuid;
        }
        return this.getFactory(false, null, url).update({}, modelObject).$promise;
      },

      $get:function(uuid, url) {
        return this.getFactory(false, null, url).get({}, {uuid: uuid}).$promise;
      },

      getEndpoint:function(isList) {
        return this.endpoint + this.endpointPostfix;
      },

      // helper, that adds functions to promise
      chainFunctionsToPromise:function(promise, functions) {
        var deferred = $q.defer();
        promise.then(
          function(response) {
            for (var i=0; i < functions.length; i++) {
              var f = functions[i];
              f(response);
              deferred.resolve(response);
            }
          },
          function(error) {
            deferred.reject(error);
          }
        );
        return deferred.promise;
      },
      pageChangingReset: function() {
        var vm = this;
        $rootScope.$on('$stateChangeSuccess', function() {
          vm.defaultFilter = {};
          vm.page = 1;
        });
      },
      getOption: function(endpointUrl) {
        return this.getFactory(false, null, endpointUrl).options().$promise;
      },
      cleanAllCache: function() {
        listCache.removeAll();
      }
    });

    return BaseServiceClass;
  }
})();

(function() {
  angular.module('ncsaas')
    .factory('listCache', ['$cacheFactory', function($cacheFactory) {
      return $cacheFactory('list-cache');
    }]);
})();
