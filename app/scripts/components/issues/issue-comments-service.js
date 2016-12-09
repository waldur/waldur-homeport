// @ngInject
export default function issueCommentsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/support-comments/';
    }
  });
  return new ServiceClass();
}
