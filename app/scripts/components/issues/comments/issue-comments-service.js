// @ngInject
export default function issueCommentsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/support-comments/';
    },

    getIssueComments(uuid, user) {
      let query = {
        issue_uuid: uuid
      };
      if (!user.is_staff && !user.is_support) {
        query.is_public = true;
      }

      return this.getAll(query);
    }
  });
  return new ServiceClass();
}
