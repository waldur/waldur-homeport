// @ngInject
export default function expertBidsService(baseServiceClass, $http) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/expert-bids/';
    },
    accept: function(bid_url) {
      return $http.post(`${bid_url}accept/`);
    }
  });
  return new ServiceClass();
}
