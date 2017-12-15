// @ngInject
export default function JiraProjectService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/jira-projects/';
    },
  });
  return new ServiceClass();
}
