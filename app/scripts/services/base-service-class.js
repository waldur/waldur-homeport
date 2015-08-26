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
          var cache = listCache.get(cacheKey);
          var resetState = listCache.get(vm.endpoint);
          vm.cacheReset = vm.cacheReset ? vm.cacheReset : (resetState ? resetState.doReset : false);
          if (!vm.cacheReset && vm.cacheTime > 0 && cache && cache.time > new Date().getTime()) {
            deferred.resolve(cache.data);
          } else {
            vm.cacheReset = false;
            if (resetState) {
              listCache.put(vm.endpoint, {doReset: false});
            }
            listCache.put(cacheKey, {data: null, time: 0});
            vm.getFactory(true, null, endpointUrl).query(filter, function(response, responseHeaders) {
              var header = responseHeaders();
              vm.resultCount = !header['x-result-count'] ? null : header['x-result-count'];
              if (vm.resultCount) {
                vm.pages = Math.ceil(vm.resultCount/vm.pageSize);
                vm.sliceStart = (vm.page - 1) * vm.pageSize + 1;
                vm.sliceEnd = Math.min(vm.resultCount, vm.page * vm.pageSize)
              }
              if (vm.cacheTime > 0) {
                var cacheTime = new Date().getTime() + (vm.cacheTime * 1000);
                listCache.put(cacheKey, {data: response, time: cacheTime});
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
      /**
       * Call this function if you want to clear cache of the current endpoint
       * during next request to the current endpoint
       */
      clearCacheOfNextRequest: function() {
        listCache.put(this.endpoint, {doReset: true});
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
