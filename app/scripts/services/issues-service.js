'use strict';


(function () {
  angular.module('ncsaas')
    .service('issuesService', ['baseServiceClass', issuesService]);

  function issuesService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/jira-issues/';
      }
    });
    return new ServiceClass();
  }
})();
