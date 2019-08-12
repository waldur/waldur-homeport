// @ngInject
export default function issuePrioritiesService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/support-priorities/';
    }
  });
  return new ServiceClass();
}
