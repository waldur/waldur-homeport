// @ngInject
export default function expertBidsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/expert-bids/';
    }
  });
  return new ServiceClass();
}
