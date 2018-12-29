import { templateParser, parseQuotasUsage, parseComponents } from '../utils';
import { templateComparator } from './openstack-template';

// @ngInject
export default function packageTemplatesService($filter, baseServiceClass, resourcesService, coreUtils) {
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
          let result = templates
            // Exclude current package template
            .filter(choice => choice.uuid !== template.uuid).map(templateParser)
            .map(choice => {
              const check = this.checkTemplate(template, quotas, choice);
              return {...choice, ...check};
            })
            .sort(templateComparator);
          return result;
        });
      });
    },

    checkTemplate: function (currentTemplate, quotas, template) {
      // Allow to change package only if current usage of all quotas <= new package quotas
      const components = parseComponents(template.components);
      const enabled = (
        quotas.cores <= components.cores &&
        quotas.ram <= components.ram &&
        quotas.disk <= components.disk);

      if (enabled) {
        return {
          disabled: false,
          disabledReason: ''
        };
      }

      let disabledReason = coreUtils.templateFormatter(gettext('Package is not available because current VPC resource usage exceeds package quota limits.'));

      const parts = [
        {
          quota: 'cores',
          label: 'vCPU',
        },
        {
          quota: 'ram',
          label: 'RAM',
          filter: 'filesize',
        },
        {
          quota: 'disk',
          label: 'Storage',
          filter: 'filesize',
        },
      ];

      const messageTemplate = gettext('{quota} usage exceeds quota limit by {amount}.');

      parts.forEach(part => {
        const amount = quotas[part.quota] - components[part.quota];
        if (amount > 0) {
          let formattedAmount = amount;
          if (part.filter) {
            formattedAmount = $filter(part.filter)(amount);
          }
          const messageContext = {
            amount: formattedAmount,
            quota: part.label,
          };
          disabledReason += ' ' + coreUtils.templateFormatter(messageTemplate, messageContext);
        }
      });

      return {
        disabled: !enabled,
        disabledReason,
      };
    }
  });
  return new ServiceClass();
}
