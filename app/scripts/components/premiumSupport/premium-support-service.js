// @ngInject
export function premiumSupportPlansService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/premium-support-plans/';
    }
  });
  return new ServiceClass();
}

// @ngInject
export function premiumSupportContractsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/premium-support-contracts/';
    }
  });
  return new ServiceClass();
}
