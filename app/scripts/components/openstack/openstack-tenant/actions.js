// @ngInject
export default function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION, ENV) {
  let tenantConfig = {
    order: [
      'edit',
      'pull',
      'assign_package',
      'change_package',
      'request_custom_flavour',
      'create_network',
      'create_security_group',
      'pull_security_groups',
      'pull_floating_ips',
      'create_floating_ip',
      'destroy'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: gettext('Tenant has been updated.')
      }),
      pull: {
        title: gettext('Synchronise')
      },
      create_network: {
        tab: 'networks',
        title: gettext('Create'),
        dialogTitle: gettext('Create network for '),
        iconClass: 'fa fa-plus',
        fields: {
          description: {
            type: 'text'
          }
        }
      },
      change_package: {
        title: gettext('Change VPC package'),
        enabled: true,
        type: 'form',
        component: 'openstackTenantChangePackageDialog',
        useResolve: true,
        isVisible: (resource) => {
          return resource.extra_configuration && resource.extra_configuration.package_uuid;
        },
        dialogSize: 'lg'
      },
      assign_package: {
        title: gettext('Assign VPC package'),
        type: 'form',
        component: 'assignPackageDialog',
        useResolve: true,
        staffOnly: true,
        enabled: true,
        feature: 'import',
        isVisible: (resource) => {
          return !(resource.extra_configuration && resource.extra_configuration.package_uuid);
        },
        dialogSize: 'lg'
      },
      create_security_group: {
        tab: 'security_groups',
        title: gettext('Create'),
        dialogTitle: gettext('Create security group for '),
        iconClass: 'fa fa-plus',
        fields: {
          rules: {
            component: 'securityGroupRuleEditor'
          }
        },
        dialogSize: 'lg'
      },
      pull_security_groups: {
        tab: 'security_groups',
        title: gettext('Synchronise')
      },
      pull_floating_ips: {
        tab: 'floating_ips',
        title: gettext('Synchronise'),
      },
      create_floating_ip: {
        tab: 'floating_ips',
        title: gettext('Create'),
        dialogTitle: gettext('Create floating IP for '),
        iconClass: 'fa fa-plus',
      },
      request_custom_flavour: {
        title: gettext('Request custom flavour'),
        component: 'openstackTenantRequestCustomFlavour',
        enabled: true,
        useResolve: true,
        type: 'form',
      },
    },
    delete_message: 'All tenant resources will be deleted.'
  };

  if (!ENV.tenantCredentialsVisible) {
    tenantConfig.order.splice(tenantConfig.order.indexOf('edit') + 1, 0, 'direct_access');
    tenantConfig.options['direct_access'] = {
      title: gettext('Request direct access'),
      component: 'openstackTenantRequestDirectAccess',
      enabled: true,
      useResolve: true,
      type: 'form',
    };
  }

  ActionConfigurationProvider.register('OpenStack.Tenant', tenantConfig);
}
