// @ngInject
export default function issueCommentsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/support-comments/';
    }
  });
  return new ServiceClass();
}
