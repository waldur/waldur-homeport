'use strict';

(function() {
  angular.module('ncsaas')
    .service('customerImageService', ['ENV', 'Upload', '$http', customerImageService]);

  function customerImageService(ENV, Upload, $http) {
    return {
      create: function(params) {
        return Upload.upload({
            url: ENV.apiEndpoint + 'api/customers/' + params.uuid + '/image/',
            method: 'PUT',
            fileFormDataName: 'image',
            file: params.file
        });
      },
      delete: function(params) {
        return $http.delete(ENV.apiEndpoint + 'api/customers/' + params.uuid + '/image/');
      }
    }
  }
})();
