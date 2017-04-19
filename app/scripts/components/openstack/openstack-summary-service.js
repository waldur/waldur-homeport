import { parsePrices, parseQuotas, parseQuotasUsage } from './utils';

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
      .then(this.aggregateQuotasFromSPL.bind(this, service));
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
    return this.$http.get(url).then(response => {
      const template = response.data;
      const components = parsePrices(template.components);
      const limits = parseQuotas(tenant.quotas);
      const usages = parseQuotasUsage(tenant.quotas);
      return { components, usages, limits };
    });
  }

  aggregateQuotasFromSPL(service, components) {
    let quotaNamesMapping = {
      vcpu: 'cores',
      storage: 'disk',
      ram: 'ram',
    };

    return this.$http.get(service.service_project_link_url).then((response) => {
      angular.forEach(response.data.quotas, (quota) => {
        let componentQuotaName = quotaNamesMapping[quota.name];
        components.limits[componentQuotaName] = Math.min(quota.limit, components.limits[componentQuotaName]);
        components.usages[componentQuotaName] = Math.max(quota.usage, components.usages[componentQuotaName]);
      });

      return components;
    });
  }
}
