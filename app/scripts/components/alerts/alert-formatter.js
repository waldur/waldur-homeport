import { ALERT_TEMPLATES, ALERT_ICONS } from './constants';

// @ngInject
export default function alertFormatter(BaseEventFormatter, $state, ncUtils) {
  let cls = BaseEventFormatter.extend({
    format: function(alert) {
      if (alert.alert_type === 'quota_usage_is_over_threshold') {
        return this.renderQuotaAlert(alert);
      } else if (alert.alert_type === 'service_has_unmanaged_resources') {
        return this.renderUnmanagedResourcesAlert(alert);
      } else {
        return this._super(alert);
      }
    },
    renderQuotaAlert: function(alert) {
      let context = {
        customer_name: alert.context.scope_name,
        quota_name: ncUtils.getPrettyQuotaName(alert.context.quota_name) + 's',
        quota_limit: alert.context.quota_limit,
        quota_threshold: 80,
        quota_use: alert.context.quota_usage,
        quota_usage: Math.round(alert.context.quota_usage * 100.0 / alert.context.quota_limit),
        plan_url: $state.href('organization.plans', {uuid: alert.context.scope_uuid})
      };
      let template;
      if (alert.context.quota_limit === alert.context.quota_usage) {
        template = 'Customer {customer_name} has reached {quota_name} quota limit ({quota_limit}). <a href="{plan_url}">Upgrade your plan</a>';
      } else {
        template = 'Customer {customer_name} has exceeded the {quota_threshold}% {quota_name} quota threshold. The quota limit is {quota_limit}, and current usage is {quota_use} ({quota_usage}% of limit). <a href="{plan_url}">Upgrade your plan</a>';
      }
      return this.renderTemplate(template, context);
    },
    renderUnmanagedResourcesAlert: function(alert) {
      let context = {
        import_url: $state.href('import.import', {
          service_type: alert.context.service_type,
          service_uuid: alert.context.service_uuid
        }),
        service_name: alert.context.service_name
      };
      let template = 'Provider {service_name} has unmanaged resources. <a href="{import_url}">Import unmanaged resources to current project</a>.';
      return this.renderTemplate(template, context);
    },
    getTemplate: function(event) {
      return ALERT_TEMPLATES[event.alert_type];
    },
    getEventContext: function(event) {
      return event.context;
    },
    getIcon: function(event) {
      return ALERT_ICONS[event.alert_type];
    },
    formatUrl: function(entity, context) {
      if (!this.routeEnabled(route)) {
        return;
      }
      let route, args, uuid = context[entity + '_uuid'];
      switch(entity) {
      case 'service':
        route = 'organization.providers';
        args = {
          uuid: context.customer_uuid,
          providerUuid: uuid,
          providerType: context.service_type,
        };
        break;

      case 'resource':
        route = 'resources.details';
        args = {
          resource_type: context.resource_type,
          uuid: uuid
        };
        break;

      case 'customer':
        route = 'organization.details';
        args = {
          uuid: context.customer_uuid
        };
        break;
      }
      if (route) {
        return $state.href(route, args);
      }
    }
  });
  return new cls();
}
