import { templateParser, parseQuotasUsage, parseComponents } from '../utils';
import { templateComparator } from './openstack-template';

// @ngInject
export default function packageTemplatesService(baseServiceClass, resourcesService) {
  let ServiceClass = baseServiceClass.extend({
    init: function () {
      this._super();
      this.endpoint = '/package-templates/';
    },

    loadTenant: function (tenant_url) {
      return resourcesService.$get(null, null, tenant_url);
    },

    loadTenantQuotasUsage: function (tenant) {
      return this.loadTenant(tenant.url).then(tenant => parseQuotasUsage(tenant.quotas));
    },

    loadTemplates: function (tenant, template) {
      return this.loadTenantQuotasUsage(tenant).then(quotas => {
        return this.getAll({
          service_settings_uuid: tenant.service_settings_uuid,
          archived: 'False',
        }).then(templates => {
          let result = templates.map(templateParser)
            .filter(this.checkTemplate.bind(this, template, quotas))
            .sort(templateComparator);
          return result;
        });
      });
    },

    checkTemplate: function (currentTemplate, quotas, template) {
      // Exclude current package template
      if (currentTemplate && currentTemplate.uuid === template.uuid) {
        return false;
      }

      // Allow to change package only if current usage of all quotas <= new package quotas
      const components = parseComponents(template.components);
      return (
        quotas.cores <= components.cores &&
        quotas.ram <= components.ram &&
        quotas.disk <= components.disk);
    }
  });
  return new ServiceClass();
}
