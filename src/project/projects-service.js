import Axios from 'axios';

// @ngInject
export default function projectsService($q, baseServiceClass) {
  const ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/projects/';
    },
    updateCertifications: function(project_url, certifications) {
      return Axios.post(project_url + 'update_certifications/', {
        certifications,
      });
    },
  });
  return new ServiceClass();
}
