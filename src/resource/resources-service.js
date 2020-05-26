import { get } from '@waldur/core/api';

// @ngInject
export default function resourcesService(baseServiceClass, ENV, $q) {
  const ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/resources/';
      this.services = undefined;
    },

    $get: function(resource_type, uuid, url) {
      const $get = this._super.bind(this);
      if (url) {
        return $get(null, url);
      }
      return this.getUrlByType(resource_type).then(function(url) {
        return $get(uuid, url);
      });
    },

    getServicesList: async function() {
      if (!this.services) {
        const response = await get('/service-metadata/');
        this.services = response.data;
      }
      return this.services;
    },

    getUrlByType: function(resource_type) {
      if (resource_type === 'JIRA.Issue') {
        return $q.when(`${ENV.apiEndpoint}api/jira-issues/`);
      } else if (resource_type === 'Support.Offering') {
        return $q.when(`${ENV.apiEndpoint}api/support-offerings/`);
      } else if (resource_type === 'Rancher.Node') {
        return $q.when(`${ENV.apiEndpoint}api/rancher-nodes/`);
      }
      const parts = resource_type.split('.');
      const service_type = parts[0];
      const type = parts[1];
      return $q.when(this.getServicesList()).then(function(services) {
        return services[service_type].resources[type];
      });
    },
  });
  return new ServiceClass();
}
