'use strict';

(function() {
  angular.module('ncsaas')
    .service('alertsService', ['baseServiceClass', 'ENV', '$rootScope', alertsService]);

  function alertsService(baseServiceClass, ENV, $rootScope) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/alerts/';
        this.filterByCustomer = false;

        var vm = this;
        $rootScope.$on('$stateChangeSuccess', function() {
          vm.setDefaultFilter();
        });
        vm.setDefaultFilter();
      },
      setDefaultFilter: function() {
        // New alerts first
        this.defaultFilter.opened = true;;
        this.defaultFilter.o = '-created';
        if (!ENV.featuresVisible) {
          this.defaultFilter.exclude_features = ENV.toBeFeatures;
        }
      }
    });
    return new ServiceClass();
  }

  angular.module('ncsaas').constant('ALERT_TEMPLATES', {
    'customer_has_zero_services': 'Organization {customer_name} has zero services configured.',
    'customer_has_zero_resources': 'Organization {customer_name} does not have any resources.',
    'customer_has_zero_projects': 'Organization {customer_name} does not have any projects.',
    'service_has_unmanaged_resources': 'Provider {service_name} has unmanaged resources.',
    'service_unavailable': 'Provider {service_name} is not responding.',
    'resource_disappeared_from_backend': 'Resource {resource_name} has disappeared from the {service_name}.',
    'customer_projected_costs_exceeded': 'This month estimated costs for organization {customer_name} exceeded.',
    'customer_project_count_exceeded': 'Organization {customer_name} has exceeded quota {quota_name}.',
    'customer_resource_count_exceeded': 'Organization {customer_name} has exceeded quota {quota_name}.',
    'customer_service_count_exceeded': 'Organization {customer_name} has exceeded quota {quota_name}.',
  });

  angular.module('ncsaas').constant('ALERT_ICONS', {
    'customer_has_zero_services': 'customer',
    'customer_has_zero_resources': 'customer',
    'customer_has_zero_projects': 'customer',
    'service_has_unmanaged_resources': 'service',
    'service_unavailable': 'service',
    'resource_disappeared_from_backend': 'resource',
    'customer_projected_costs_exceeded': 'customer',
    'customer_project_count_exceeded': 'customer',
    'customer_resource_count_exceeded': 'customer',
    'customer_service_count_exceeded': 'customer',
    'quota_usage_is_over_threshold': 'customer',
  });

  angular.module('ncsaas').service('alertFormatter', [
    'ALERT_TEMPLATES', 'ALERT_ICONS', 'BaseEventFormatter', '$state', 'ncUtils', alertFormatter]);

  function alertFormatter(ALERT_TEMPLATES, ALERT_ICONS, BaseEventFormatter, $state, ncUtils) {
      var cls = BaseEventFormatter.extend({
          format: function(alert) {
            if (alert.alert_type == 'quota_usage_is_over_threshold') {
              return this.renderQuotaAlert(alert);
            } else {
              return this._super(alert);
            }
          },
          renderQuotaAlert: function(alert) {
            var context = {
               customer_name: alert.context.scope_name,
               quota_name: ncUtils.getPrettyQuotaName(alert.context.quota_name) + 's',
               quota_limit: alert.context.quota_limit,
               quota_threshold: 80,
               quota_use: alert.context.quota_usage,
               quota_usage: alert.context.quota_usage * 100.0 / alert.context.quota_limit,
               plan_url: $state.href('organizations.plans', {uuid: alert.context.scope_uuid})
            }
            if (alert.context.quota_limit == alert.context.quota_usage) {
              var template = 'Customer {customer_name} has reached {quota_name} quota limit ({quota_limit}). <a href="{plan_url}">Upgrade your plan</a>';
            } else {
              var template = 'Customer {customer_name} has exceeded the {quota_threshold}% {quota_name} quota threshold. The quota limit is {quota_limit}, and current usage is {quota_use} ({quota_usage}% of limit). <a href="{plan_url}">Upgrade your plan</a>';
            }
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
              var route, args, uuid = context[entity + "_uuid"];
              switch(entity) {
                case 'service':
                route = 'organizations.details';
                args = {
                  uuid: context.customer_uuid,
                  providerUuid: uuid,
                  providerType: context.service_type,
                  tab: 'providers'
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
                route = 'organizations.details';
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
})();
