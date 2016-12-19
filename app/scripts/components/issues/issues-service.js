import { ISSUE_IDS } from './constants';

// @ngInject
export default function issuesService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/support-issues/';
      this.filterByCustomer = false;
    },
    setDefaultFilter: function() {
      // New issues come first
      this.defaultFilter = {o: '-created'};
    },
    createIssue: function(instance) {
      var issue = this.$create();
      angular.extend(issue, instance);
      return issue.$save();
    },
    createChangeRequest: function(details) {
      return this.createIssue(angular.extend({
        type: ISSUE_IDS.CHANGE_REQUEST
      }, details));
    },
    createServiceRequest: details => {
      return this.createIssue(angular.extend({
        type: ISSUE_IDS.SERVICE_REQUEST
      }, details));
    }
  });
  return new ServiceClass();
}
