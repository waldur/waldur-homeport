export function premiumSupportPlansService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/premium-support-plans/';
      this.filterByCustomer = false;
    }
  });
  return new ServiceClass();
}

export function premiumSupportContractsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/premium-support-contracts/';
      this.filterByCustomer = false;
    }
  });
  return new ServiceClass();
}
