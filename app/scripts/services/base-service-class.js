// jscs:disable
(function(){
  angular.module('ncsaas')
    .service('baseServiceClass', ['$q', baseServiceClass]);
  function baseServiceClass($q) {
    // Base service class for services with pagination
    // pageSize, page, pages - default variables, you can change this in your init method or call this._super() in init
    // you should set currentStateService and rawFabric service in your init method for correct getList work
    var BaseServiceClass = Class.extend({
      pageSize:null,
      page:null,
      pages:null,
      currentStateService:null,
      rawFabric:null,
      rawInstance:null,

      init:function(){
        this.pageSize = 10;
        this.page = 1;
        this.pages = null;
      },
      getInstanceList:function(filter) {
        var vm = this;
        var deferred = $q.defer();
        filter = filter || {};
        vm.currentStateService.getCustomer().then(function(response) {
          /*jshint camelcase: false */
          filter.customer_name = response.name;
          filter.page = vm.page;
          filter.page_size = vm.pageSize;
          vm.rawFabric.query(filter,function(response, responseHeaders){
            var header = responseHeaders(),
              objQuantity = !header['x-result-count'] ? null : header['x-result-count'];
            if (objQuantity) {
              vm.pages = Math.ceil(objQuantity/vm.pageSize);
            }
            deferred.resolve(response);
          }, function(err) {
            deferred.reject(err);
          });

        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },
      createInstance:function() {
        return new this.rawInstance();
      },
      deleteInstance:function(params) {
        var deferred = $q.defer();
        this.rawInstance.Delete({},params).$promise.then(function(response) {
          deferred.resolve(response);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },
      getFactoryItem:function(params) {
        return this.rawFabric.get(params).$promise;
      }
    });

    return BaseServiceClass;
  }
})();
