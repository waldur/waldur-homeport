'use strict';

(function() {

  angular.module('ncsaas').directive('responsiveTable', responsiveTable);

  responsiveTable.$inject = ['$http', 'ENV'];

  function responsiveTable($http, ENV) {
    return {
      restrict: 'C',
      link: function(scope, element) {
        $(element[0]).DataTable({
          "responsive": true,
          "processing": true,
          "serverSide": true,
          "ajax": serverDataTableCallback
        });

        function serverDataTableCallback(request, drawCallback, settings) {
          console.log(request)
          settings.jqXHR = $.ajax({
            "dataType": "json",
            "headers": {
              "Authorization": $http.defaults.headers.common.Authorization
            },
            "data": {
              "page_size": request.length,
            }
            "url": ENV.apiEndpoint + 'api/projects/',
            "success": function(json) {
              console.log(json)
              drawCallback({
                "draw": 1,
                "recordsTotal": 57,
                "recordsFiltered": 57,
                "data": json.map(function(item) {
                  return [item.uuid, item.name, item.customer_name];
                })
              })
            }
          });
        }
      }
    };
  }
})();
