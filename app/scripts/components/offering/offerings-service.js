// @ngInject
export default function offeringsService(baseServiceClass, $http, ENV) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/support-offerings/';
    },

    getConfiguration: function() {
      const endpoint = 'api/support-offerings/configured/';
      return $http.get(ENV.apiEndpoint + endpoint)
        .then(response => response.data);
    },

    createOffering: function(offering) {
      const endpoint = 'api/support-offerings/';
      return $http.post(ENV.apiEndpoint + endpoint, offering)
        .then(response => response.data);
    }
  });
  return new ServiceClass();
}
