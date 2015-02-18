'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourcesService', ['RawResource','currentStateService', resourcesService]);

  function resourcesService(RawResource, currentStateService) {

    var vm = this;
    vm.getResourcesList = getResourcesList;
    vm.getRawResourcesList = getRawResourcesList;


    function getRawResourcesList() {
      return RawResource.query();
    }

    function getResourcesList() {
      currentStateService.getCustomer().$promise.then(function(response){
        console.log(response.name);
        var customerName = response.name;
        var resources = RawResource.query({customer_name: customerName});

      });
    }

  }
})();

(function() {
  angular.module('ncsaas')
    .factory('RawResource', ['ENV', '$resource', RawResource]);

  function RawResource(ENV, $resource) {
    return $resource(
      ENV.apiEndpoint + 'api/services/', {},
      {
        update: {
          method: 'PUT'
        }
      }
    );
  }
})();
