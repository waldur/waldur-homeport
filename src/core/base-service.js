/**
 * Base service class for services with pagination
 *   getList
 *   $get
 *   $delete
 *   $create
 *   operation
 */

// @ngInject
export function baseServiceClass($q, $http, $resource, ENV, $rootScope, listCache) {
  // pageSize, page, pages - default variables, you can change this in your init method or call this._super() in init
  let BaseServiceClass = Class.extend({
    ALL_CACHE_KEYS: 'ALL_CACHE_KEYS',
    pageSize:null,
    page:null,
    pages:null,
    resultCount:null,
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
      this.postprocessors = [];
      this.setDefaultFilter();
      this.pageChangingReset();
      this.cacheTime = 0;

      let vm = this;
      $rootScope.$on('logoutStart', function() {
        vm.clearAllCacheForCurrentEndpoint();
      });
    },

    pushPostprocessor: function(postprocessor) {
      this.postprocessors.push(postprocessor);
    },

    applyPostprocessors: function(items) {
      let vm = this;
      return items.map(function(item) {
        return vm.postprocessors.reduce(function(result, postprocessor) {
          return postprocessor(result);
        }, item);
      });
    },

    getList:function(filter, endpointUrl) {
      let vm = this;
      let deferred = $q.defer();
      filter = angular.extend({}, this.defaultFilter, filter);
      let queryList = function() {
        filter.page = filter.page || vm.page;
        /*jshint camelcase: false */
        filter.page_size = vm.pageSize;
        let cacheKey = (endpointUrl || vm.endpoint) + JSON.stringify(filter);
        let cache = vm.getCache(cacheKey);

        if (!vm.cacheReset && vm.cacheTime > 0 && cache && cache.time > new Date().getTime()) {
          vm.setPagesCount(cache.count);
          deferred.resolve(cache.data);
        } else {
          vm.cacheReset = false;
          listCache.put(cacheKey, {data: null, time: 0});
          vm.getFactory(true, null, endpointUrl).query(filter, function(response, responseHeaders) {
            response = vm.applyPostprocessors(response);
            let header = responseHeaders();
            let resultCount = !header['x-result-count'] ? null : header['x-result-count'];
            response.resultCount = resultCount;
            vm.setPagesCount(resultCount);
            if (vm.cacheTime > 0) {
              vm.setCache(vm.cacheTime, response, cacheKey, vm.endpoint);
            }
            deferred.resolve(response);
          }, function(err) {
            deferred.reject(err);
          });
        }
      };

      queryList();
      return deferred.promise;
    },
    getAll: function(filter, endpointUrl) {
      let vm = this;
      let oldPageSize = vm.pageSize;
      vm.pageSize = 100;
      return vm.getList(filter, endpointUrl).then(function(response) {
        if (vm.pages > 1) {
          let pages = {1: response};
          let promises = [];
          for (let page = 2; page < vm.pages + 1; page++) {
            (function(page) {
              let query = angular.extend({}, filter, {page: page});
              let promise = vm.getList(query, endpointUrl).then(function(response) {
                pages[page] = response;
              });
              promises.push(promise);
            })(page);
          }
          return $q.all(promises).then(function() {
            let result = [];
            for (let i = 1; i < vm.pages + 1; i++) {
              let page = pages[i];
              if (!page) {
                continue;
              }
              for (let j = 0; j < page.length; j++) {
                result.push(page[j]);
              }
            }
            return result;
          });
        }
        return response;
      }).finally(function() {
        vm.pageSize = oldPageSize;
      });
    },
    setCache: function(time, response, cacheKey, endpoint) {
      let allCacheKeys = listCache.get(this.ALL_CACHE_KEYS) ? listCache.get(this.ALL_CACHE_KEYS) : {};
      let keysForCurrentEndpoint = allCacheKeys[endpoint] ? allCacheKeys[endpoint] : [];
      if (keysForCurrentEndpoint.indexOf(cacheKey) === -1) {
        keysForCurrentEndpoint.push(cacheKey);
        allCacheKeys[endpoint] = keysForCurrentEndpoint;
        listCache.put(this.ALL_CACHE_KEYS, allCacheKeys);
      }
      let cacheTime = new Date().getTime() + (time * 1000);
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
        this.sliceEnd = Math.min(this.resultCount, this.page * this.pageSize);
      }
    },
    clearAllCacheForCurrentEndpoint: function() {
      let allKeys = listCache.get(this.ALL_CACHE_KEYS);
      if (!allKeys) {
        return;
      }
      let currentKeys = allKeys[this.endpoint];
      if (currentKeys) {
        for (let i = 0; i < currentKeys.length; i++) {
          listCache.remove(currentKeys[i]);
        }
      }
    },
    $create:function(endpointUrl) {
      let Instance = this.getFactory(false, null, endpointUrl);
      return new Instance();
    },

    $delete:function(uuid) {
      return this.getFactory(false).remove({}, {uuid: uuid}).$promise;
    },

    /**
     * Use this function if you need to remove some entity by full endPoint url
     *
     * @param url     string   endPoint url
     * @return promise
     */
    $deleteByUrl: function(url) {
      return this.getFactory(false, null, url).remove().$promise;
    },

    operation: function(operation, url) {
      let factory = this.getFactory(false, null, url);
      return factory.operation({ operation }).$promise;
    },

    getFactory: function(isList, endpoint, endpointUrl) {
      endpoint = endpoint || this.getEndpoint(isList);
      endpointUrl = endpointUrl || ENV.apiEndpoint + 'api' + endpoint;
      /*jshint camelcase: false */
      return $resource(endpointUrl + ':UUID/:operation/', {
        UUID: '@uuid',
        page_size: '@page_size',
        page: '@page',
        operation: '@operation'
      }, {
        operation: {
          method: 'POST',
          url: endpointUrl + ':UUID/:operation/',
          params: {
            UUID: '@uuid',
            operation: '@operation'
          }
        },
        update: {
          method: 'PUT'
        },
        options: {
          method: 'OPTIONS'
        }
      });
    },

    update: function(model) {
      return $http.put(model.url, model);
    },

    $update: function(uuid, url, fields) {
      let modelObject = JSON.parse(JSON.stringify(fields));
      if (url) {
        delete modelObject.uuid;
      } else {
        modelObject.uuid = uuid;
      }
      return this.getFactory(false, null, url).update({}, modelObject).$promise;
    },

    $get: function(uuid, url, filters) {
      filters = filters || {};
      return this.getFactory(false, null, url).get(filters, angular.extend(filters, {uuid: uuid})).$promise;
    },

    getEndpoint: function() {
      return this.endpoint + this.endpointPostfix;
    },

    // helper, that adds functions to promise
    chainFunctionsToPromise:function(promise, functions) {
      let deferred = $q.defer();
      promise.then(
        function(response) {
          for (let i=0; i < functions.length; i++) {
            let f = functions[i];
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
      let vm = this;
      $rootScope.$on('$stateChangeSuccess', function() {
        vm.setDefaultFilter();
        vm.page = 1;
      });
    },
    setDefaultFilter: function() {
      this.defaultFilter = {};
    },
    getOption: function(endpointUrl) {
      let deferred = $q.defer();
      let cacheKey = [endpointUrl, 'OPTIONS'].join('');
      let vm = this;
      let cache = vm.getCache(cacheKey);

      if (cache && cache.time > new Date().getTime()) {
        deferred.resolve(cache.data);
      } else {
        vm.getFactory(false, null, endpointUrl).options().$promise.then(function(response) {
          vm.setCache(ENV.optionsCacheTime, response, cacheKey, endpointUrl);
          deferred.resolve(response);
        });
      }

      return deferred.promise;
    },
    cleanOptionsCache: function(endpointUrl) {
      let cacheKey = [endpointUrl, 'OPTIONS'].join('');
      listCache.remove(cacheKey);
    },
    cleanAllCache: function() {
      listCache.removeAll();
    }
  });

  return BaseServiceClass;
}

// @ngInject
export function listCache($cacheFactory) {
  return $cacheFactory('list-cache');
}
