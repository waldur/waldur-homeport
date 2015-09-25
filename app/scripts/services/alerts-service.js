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
    'service_has_unmanaged_resources': 'Service {service_name} has unmanaged resources',
    'service_unavailable': 'Service account {service_name} is not responding',
    'resource_disappeared_from_backend': 'Resource {resource_name} has disappeared from the {service_name}',
    'customer_projected_costs_exceeded': 'This month estimated costs for organization {customer_name} exceeded',
    'customer_project_count_exceeded': 'Organization {customer_name} has exceeded quota {quota_name}.',
    'customer_resource_count_exceeded': 'Organization {customer_name} has exceeded quota {quota_name}.',
    'customer_service_count_exceeded': 'Organization {customer_name} has exceeded quota {quota_name}.',
    'quota_usage_is_over_threshold': 'Quota {quota_name} is over threshold. Limit: {quota_limit}, usage: {quota_usage}',
  });

  angular.module('ncsaas').service('alertFormatter', ['ALERT_TEMPLATES', 'BaseEventFormatter', alertFormatter]);

  function alertFormatter(ALERT_TEMPLATES, BaseEventFormatter) {
      var cls = BaseEventFormatter.extend({
          getTemplate: function(event) {
              return ALERT_TEMPLATES[event.alert_type];
          },
          getEventContext: function(event) {
              return event.context;
          }
      });
      return new cls();
  }
})();
