import { parsePrices, parseQuotas, parseQuotasUsage } from './utils';
import {QUOTA_PACKAGE_TYPE, QUOTA_SPL_TYPE, QUOTA_NAMES_MAPPING} from './../quotas/constants';
import { translate } from '@waldur/i18n';

export default class OpenStackSummaryService {
  // @ngInject
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
      return this.$q.reject({
        details: translate('Service provider is not linked with OpenStack tenant.')
      });
    }
    return this.$http.get(scope).then(response => response.data);
  }

  fetchTenantTemplate(tenant) {
    const config = tenant.extra_configuration;
    if (!config || !config.package_uuid) {
      return this.$q.reject({
        details: translate('OpenStack tenant is not linked with package template.')
      });
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
    components.limitsType = {};

    return this.$http.get(service.service_project_link_url).then((response) => {
      angular.forEach(response.data.quotas, (quota) => {
        let componentQuotaName = QUOTA_NAMES_MAPPING[quota.name];
        if (quota.limit !== -1) {
          if (quota.limit < components.limits[componentQuotaName]) {
            components.limits[componentQuotaName] = quota.limit;
            components.limitsType[componentQuotaName] = QUOTA_SPL_TYPE;
          } else {
            components.limits[componentQuotaName] = components.limits[componentQuotaName];
            components.limitsType[componentQuotaName] = QUOTA_PACKAGE_TYPE;
          }
        } else {
          components.limitsType[componentQuotaName] = QUOTA_PACKAGE_TYPE;
        }
        components.usages[componentQuotaName] = Math.max(quota.usage, components.usages[componentQuotaName]);
      });
      return components;
    });
  }
}
