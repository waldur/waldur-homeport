// @ngInject
export default function costPlansService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/deployment-plans/';
    }
  });
  return new ServiceClass();
}
