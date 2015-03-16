// jscs:disable
(function(){
  angular.module('ncsaas')
    .service('baseServiceClass', ['$q', 'currentStateService', '$resource', 'ENV', baseServiceClass]);
  function baseServiceClass($q, currentStateService, $resource, ENV) {
    // Base service class for services with pagination
    // pageSize, page, pages - default variables, you can change this in your init method or call this._super() in init
    // you should set currentStateService and rawFabric service in your init method for correct getList work
    var BaseServiceClass = Class.extend({
      pageSize:null,
      page:null,
      pages:null,
      currentStateService:null,
      endpoint:null,
      rawFabric:null,
      rawInstance:null,

      init:function(){
        this.pageSize = 10;
        this.page = 1;
        this.pages = null;
        this.currentStateService = currentStateService;
        this.stopResource = this.Operation.bind(null, 'stop');
        this.startResource = this.Operation.bind(null, 'start');
        this.restartResource = this.Operation.bind(null, 'restart');
        this.getEndpoint = this.getEndpointUrl;
      },
      getList:function(filter) {
        var vm = this;
        var deferred = $q.defer();
        filter = filter || {};
        var queryList = function() {
          filter.page = vm.page;
          filter.page_size = vm.pageSize;
          vm.getFactory().query(filter,function(response, responseHeaders){
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
            filter.customer_name = response.name;
            queryList();
          }, function (err) {
            deferred.reject(err);
          });
        }

        return deferred.promise;
      },
      create:function() {
        return new this.getFactory();
      },
      delete:function(uuid) {
        var deferred = $q.defer();
        this.getFactory().Delete({},{uuid: uuid}).$promise.then(function(response) {
          deferred.resolve(response);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },
      Operation:function(operation, uuid) {
        var deferred = $q.defer();
        this.getFactory().Operation({uuid: uuid, operation: operation}).$promise.then(function(response){
          deferred.resolve(response);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },
      getFactory:function(params) {
        return $resource(ENV.apiEndpoint + 'api' + this.getEndpoint(params) + ':UUID/', {UUID:'@uuid'},
          {
            Operation: {
              method:'POST',
              url:ENV.apiEndpoint + 'api/instances/:UUID/:operation/',
              params: {UUID:'@uuid', operation:'@operation'}
            },
            Delete: {
              method:'DELETE'
            }
          }
        );
      },
      get:function(uuid) {
        return this.rawFabric.get({uuid: uuid}).$promise;
      },
      getEndpointUrl:function() {
        return this.endpoint;
      }
    });

    return BaseServiceClass;
  }
})();
