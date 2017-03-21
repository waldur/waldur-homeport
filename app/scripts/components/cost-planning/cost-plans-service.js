// @ngInject
export default function costPlansService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/deployment-plans/';
      this.pushPostprocessor(plan => {
        angular.forEach(plan.items, item => {
          item.preset.disk = item.preset.storage;
        });
        return plan;
      });
    }
  });
  return new ServiceClass();
}
