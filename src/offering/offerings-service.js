import { getAll, getById } from '@waldur/core/api';

// @ngInject
export default function offeringsService(baseServiceClass, $http, ENV) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/support-offerings/';
    },

    getConfiguration: function() {
      return getAll('/support-offering-templates/');
    },

    getOffering: function(id) {
      return getById('/support-offering-templates/', id);
    },

    createOffering: function(offering) {
      const endpoint = 'api/support-offerings/';
      return $http.post(ENV.apiEndpoint + endpoint, offering)
        .then(response => response.data);
    }
  });
  return new ServiceClass();
}
