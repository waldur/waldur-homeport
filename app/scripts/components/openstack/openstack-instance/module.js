import openstackInstanceSummary from './openstack-instance-summary';
import OpenStackInstanceConfig from './openstack-instance-config';

export default module => {
  module.directive('openstackInstanceSummary', openstackInstanceSummary);
  module.config(fieldsConfig);
  module.config(actionConfig);
  module.config(stateConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Instance', OpenStackInstanceConfig);
}

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.Instance', {
    order: [
      'pull',
      'start',
      'stop',
      'restart',
      'change_flavor',
      'assign_floating_ip',
      'update_security_groups',
      'unlink',
      'destroy'
    ],
    options: {
      pull: {
        title: 'Synchronise'
      },
      change_flavor: {
        title: 'Change flavor',
        fields: {
          flavor: {
            formatter: OpenStackInstanceConfig.options.flavor.formatter
          }
        }
      },
      update_security_groups: {
        title: 'Update security groups',
        fields: {
          security_groups: {
            urlFormatter: urlFormatter,
            value_field: 'url',
            resource_default_value: true,
            endpoint: '/openstacktenant-security-groups/',
            urlParams: [
              'service_settings_uuid'
            ]            
          }
        }
      },
      destroy: {
        fields: {
          delete_volumes: {
            default_value: true
          }
        }
      }
    }
  });

  function urlFormatter(apiEndpoint, endpoint, params, resource) {
    let urlParams = '';
    if (params) {
      urlParams += '?';
      params.forEach(function(param, index){
        urlParams += (param + '=' + resource[param]);
        if (index + 1 < params.length) {
          urlParams += '&';
        }
      });
    }
    return apiEndpoint + 'api' + endpoint + urlParams;
  }
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Instance', {
    error_states: [
      'ERROR'
    ],
    shutdown_states: [
      'SHUTOFF',
      'STOPPED',
      'SUSPENDED'
    ]
  });
}
