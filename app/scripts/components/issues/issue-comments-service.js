// @ngInject
export default function issueCommentsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/jira-comments/';
    }
  });
  return new ServiceClass();
}
