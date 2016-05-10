'use strict';


(function () {
  angular.module('ncsaas')
    .service('issueCommentsService', ['ENV', '$resource', 'baseServiceClass', issueCommentsService]);

  function issueCommentsService(ENV, $resource, baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/jira-comments/';
      }
    });
    return new ServiceClass();
  }
})();

