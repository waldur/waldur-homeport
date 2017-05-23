// @ngInject
export default function priceEstimationService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/price-estimates/';
    }
  });
  return new ServiceClass();
}
