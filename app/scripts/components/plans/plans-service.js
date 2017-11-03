// @ngInject
export default function plansService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/plans/';
    },
    getFreePlan: function() {
      return this.getList().then(function(plans) {
        for (let i = 0; i < plans.length; i++) {
          if (plans[i].price === '0.00') {
            return plans[i];
          }
        }
      });
    }
  });
  return new ServiceClass();
}
