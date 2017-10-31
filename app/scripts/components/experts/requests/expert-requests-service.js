// @ngInject
export default function expertRequestsService(baseServiceClass, $q, $http, ENV) {
  let ServiceClass = baseServiceClass.extend({
    filterByCustomer: false,

    init: function () {
      this._super();
      this.endpoint = '/expert-requests/';
    },

    create: function (expertRequest) {
      return $http.post(`${ENV.apiEndpoint}api${this.endpoint}`, expertRequest)
        .then(response => response.data);
    },

    cancel: function (expertRequest) {
      return $http.post(`${expertRequest.url}cancel/`)
        .then(response => response.data);
    },

    complete: function (expertRequest) {
      return $http.post(`${expertRequest.url}complete/`)
        .then(response => response.data);
    },

    getConfiguration: function () {
      return $http.get(`${ENV.apiEndpoint}api${this.endpoint}configured/`)
        .then(response => response.data);
    },

    getUsers: function (expertRequest) {
      return $http.get(`${expertRequest.url}users/`)
        .then(response => response.data);
    },
  });
  return new ServiceClass();
}
