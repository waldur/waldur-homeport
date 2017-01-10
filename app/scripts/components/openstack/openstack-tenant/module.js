import OpenStackTenantConfig from './openstack-tenant-config';
import openstackTenantSummary from './openstack-tenant-summary';
import openstackTenantChangePackageDialog from './openstack-tenant-change-package';
import packageTemplatesService from './package-templates-service';
import openstackPackagesService from './openstack-packages-service';
import openstackTenantChangePackageService from './openstack-tenant-change-package-service';

export default module => {
  module.config(fieldsConfig);
  module.config(actionConfig);
  module.config(tabsConfig);
  module.directive('openstackTenantSummary', openstackTenantSummary);
  module.directive('openstackTenantChangePackageDialog', openstackTenantChangePackageDialog);
  module.service('packageTemplatesService', packageTemplatesService);
  module.service('openstackPackagesService', openstackPackagesService);
  module.service('openstackTenantChangePackageService', openstackTenantChangePackageService);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStack.Tenant', OpenStackTenantConfig);
}

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStack.Tenant', {
    order: [
      'edit',
      'pull',
      'change_package',
      'create_network',
      'create_security_group',
      'destroy'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: 'Tenant has been updated'
      }),
      pull: {
        title: 'Synchronise'
      },
      create_network: {
        title: 'Create network',
        fields: {
          description: {
            type: 'text'
          }
        }
      },
      change_package: {
        title: 'Change VPC package',
        enabled: true,
        type: 'form',
        component: 'openstackTenantChangePackageDialog',
        dialogSize: 'lg'
      },
      create_security_group: {
        title: 'Create security group',
        fields: {
          rules: {
            component: 'securityGroupRuleEditor'
          }
        },
        dialogSize: 'lg'
      }
    },
    delete_message: 'All tenant resources will be deleted.'
  });
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStack.Tenant', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'networks',
      'security_groups',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      networks: {
        heading: 'Networks',
        component: 'openstackTenantNetworks'
      },
      security_groups: {
        heading: 'Security groups',
        component: 'openstackSecurityGroupsList'
      }
    })
  });
}
