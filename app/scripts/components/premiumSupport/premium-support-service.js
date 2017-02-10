export function premiumSupportPlansService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/premium-support-plans/';
    }
  });
  return new ServiceClass();
}

export function premiumSupportContractsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/premium-support-contracts/';
    }
  });
  return new ServiceClass();
}
