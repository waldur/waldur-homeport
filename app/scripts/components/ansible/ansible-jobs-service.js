// @ngInject
export default function AnsibleJobsService(ENV, $http, baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/ansible-jobs/';
    },

    create: function(ansibleJob) {
      return $http.post(`${ENV.apiEndpoint}api${this.endpoint}`, ansibleJob)
        .then(response => response.data);
    },
  });
  return new ServiceClass();
}
