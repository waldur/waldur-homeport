// @ngInject
export default function JiraIssuesService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/jira-issues/';
    },
  });
  return new ServiceClass();
}
