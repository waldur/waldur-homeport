'use strict';

(function() {
  angular.module('ncsaas')
    .service('templatesService', ['RawTemplate', templatesService]);

  function templatesService(RawTemplate) {
    /*jshint validthis: true */
    var vm = this;
    vm.getTemplateList = getTemplateList;

    function getTemplateList() {
      return RawTemplate.query().$promise;
    }

  }

})();

(function() {
  angular.module('ncsaas')
    .factory('RawTemplate', ['ENV', '$resource', RawTemplate]);

    function RawTemplate(ENV, $resource) {
      return $resource(ENV.apiEndpoint + 'api/templates/:templateUUID/', {templateUUID:'@uuid'});
    }

})();
