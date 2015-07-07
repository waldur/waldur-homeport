'use strict';


(function () {
  angular.module('ncsaas')
    .service('issueCommentsService', ['ENV', '$resource', 'baseServiceClass', issueCommentsService]);

  function issueCommentsService(ENV, $resource, baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      getFactory: function(isList, endpoint) {
        endpoint = ENV.apiEndpoint + 'api/issues/:key/comments/:UUID';
        /*jshint camelcase: false */
        return $resource(endpoint, {key: '@key', UUID: '@uuid', 
                page_size: '@page_size', page: '@page'},
          {
            operation: {
              method: 'POST',
              url: endpoint,
              params: {key: '@key', UUID: '@uuid'}
            },
            update: {
              method: 'PUT'
            }
          });
      }
    });
    return new ServiceClass();
  }
})();

