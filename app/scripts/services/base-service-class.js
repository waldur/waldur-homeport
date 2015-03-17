// jscs:disable
(function(){
  angular.module('ncsaas')
    .service('baseServiceClass', ['$q', 'currentStateService', '$resource', 'ENV', baseServiceClass]);
  function baseServiceClass($q, currentStateService, $resource, ENV) {
    // Base service class for services with pagination
    // pageSize, page, pages - default variables, you can change this in your init method or call this._super() in init
    var BaseServiceClass = Class.extend({
      pageSize:null,
      page:null,
      pages:null,
      currentStateService:null,
      endpoint:null,
      customerName:null,

      init:function(){
        this.pageSize = 10;
        this.page = 1;
        this.pages = null;
        this.currentStateService = currentStateService;
        this.stopResource = this.operation.bind(null, 'stop');
        this.startResource = this.operation.bind(null, 'start');
        this.restartResource = this.operation.bind(null, 'restart');
      },
      getList:function(filter) {
        var vm = this;
        var deferred = $q.defer();
        filter = filter || {};
        var queryList = function() {
          filter.page = vm.page;
          filter.page_size = vm.pageSize;
          vm.getFactory(true).query(filter,function(response, responseHeaders){
            var header = responseHeaders(),
              objQuantity = !header['x-result-count'] ? null : header['x-result-count'];
            if (objQuantity) {
              vm.pages = Math.ceil(objQuantity/vm.pageSize);
            }
            deferred.resolve(response);
          }, function(err) {
            deferred.reject(err);
          });
        };

        if (vm.currentStateService == null) {
          queryList();
        } else {
          vm.currentStateService.getCustomer().then(function (response) {
            /*jshint camelcase: false */
            filter.customer_name = (this.customerName) ? this.customerName() : response.name;
            queryList();
          }, function (err) {
            deferred.reject(err);
          });
        }

        return deferred.promise;
      },
      $create:function() {
        var Instance = this.getFactory(false);
        return new Instance();
      },
      $delete:function(uuid) {
        var deferred = $q.defer();
        this.getFactory(false).Delete({},{uuid: uuid}).$promise.then(function(response) {
          deferred.resolve(response);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },
      operation:function(operation, uuid) {
        var deferred = $q.defer();
        this.getFactory(false).Operation({uuid: uuid, operation: operation}).$promise.then(function(response){
          deferred.resolve(response);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },
      getFactory:function(params) {
        return $resource(ENV.apiEndpoint + 'api' + this.getEndpoint(params) + ':UUID/', {UUID:'@uuid',
            page_size:'@page_size', page:'@page'},
          {
            Operation: {
              method:'POST',
              url:ENV.apiEndpoint + 'api' + this.getEndpoint(params) + ':UUID/:operation/',
              params: {UUID:'@uuid', operation:'@operation'}
            },
            Delete: {
              method:'DELETE'
            }
          }
        );
      },
      $get:function(uuid) {
        return this.getFactory(false).get({uuid: uuid}).$promise;
      },
      getEndpoint:function(isList) {
        return this.endpoint;
      }
    });

    return BaseServiceClass;
  }
})();
