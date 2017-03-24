// @ngInject
export default function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStack.Tenant', {
    order: [
      'edit',
      'pull',
      'pull_quotas',
      'change_package',
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
      pull_quotas: {
        title: gettext('Synchronise quotas')
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
    },
    delete_message: 'All tenant resources will be deleted.'
  });
}
