import { parsePrices } from './utils';

// @ngInject
export default class OpenStackSummaryService {
  constructor($http, $q, ENV) {
    this.$http = $http;
    this.$q = $q;
    this.ENV = ENV;
  }

  getServiceComponents(service) {
    return this.fetchServiceSettings(service)
      .then(this.fetchSettingsScope.bind(this))
      .then(this.fetchTenantTemplate.bind(this))
      .then(template => parsePrices(template.components));
  }

  fetchServiceSettings(service) {
    return this.$http.get(service.settings).then(response => response.data);
  }

  fetchSettingsScope(settings) {
    const scope = settings.scope;
    if (!scope) {
      return this.$q.reject();
    }
    return this.$http.get(scope).then(response => response.data);
  }

  fetchTenantTemplate(tenant) {
    const config = tenant.extra_configuration;
    if (!config || !config.package_uuid) {
      return this.$q.reject();
    }
    const url = `${this.ENV.apiEndpoint}api/package-templates/${config.package_uuid}/`;
    return this.$http.get(url).then(response => response.data);
  }
}
