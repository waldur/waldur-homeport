'use strict';


(function () {
  angular.module('ncsaas')
    .service('issuesService', ['baseServiceClass', 'ENV', issuesService]);

  function issuesService(baseServiceClass, ENV) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/jira-issues/';
      },
      setDefaultFilter: function() {
        // New issues come first
        this.defaultFilter = {o: '-updated'};
      },
      createIssue: function(instance) {
        var issue = this.$create();
        issue.project = ENV.apiEndpoint + 'api/jira-projects/' + ENV.supportProjectUUID + '/';
        issue.summary = instance.summary;
        issue.impact = 'n/a';
        issue.priority = 'n/a';
        issue.description = instance.description;
        return issue.$save();
      }
    });
    return new ServiceClass();
  }
})();
