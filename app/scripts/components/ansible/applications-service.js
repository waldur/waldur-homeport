// @ngInject
export default function ApplicationService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/applications/';
    }
  });
  return new ServiceClass();
}
