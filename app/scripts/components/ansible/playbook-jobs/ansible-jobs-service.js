// @ngInject
export default function AnsibleJobsService(ENV, $http, baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/ansible-jobs/';
    },

    create: function(payload) {
      return $http.post(`${ENV.apiEndpoint}api${this.endpoint}`, payload)
        .then(response => response.data);
    },

    estimate: function(payload) {
      return $http.post(`${ENV.apiEndpoint}api/ansible-estimator/`, payload)
        .then(response => response.data);
    },

    getPayload(job, playbook, provider) {
      const { name, description, ssh_public_key, ...parameters } = job;
      const payload = {
        name,
        description,
        arguments: parameters,
        playbook: playbook.url,
        ssh_public_key: ssh_public_key.url,
        service_project_link: provider.service_project_link_url,
      };
      return payload;
    }
  });
  return new ServiceClass();
}
