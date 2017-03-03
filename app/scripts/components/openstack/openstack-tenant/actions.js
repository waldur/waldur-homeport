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
        successMessage: 'Tenant has been updated'
      }),
      pull: {
        title: 'Synchronise'
      },
      pull_quotas: {
        title: 'Synchronise quotas'
      },
      create_network: {
        tab: 'networks',
        title: 'Create',
        dialogTitle: 'Create network for ',
        iconClass: 'fa-plus',
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
        tab: 'security_groups',
        title: 'Create',
        dialogTitle: 'Create security group for ',
        iconClass: 'fa-plus',
        fields: {
          rules: {
            component: 'securityGroupRuleEditor'
          }
        },
        dialogSize: 'lg'
      },
      pull_security_groups: {
        tab: 'security_groups',
        title: 'Synchronise'
      },
      pull_floating_ips: {
        tab: 'floating_ips',
        title: 'Synchronise',
      },
      create_floating_ip: {
        tab: 'floating_ips',
        title: 'Create',
        dialogTitle: 'Create floating IP for ',
        iconClass: 'fa-plus',
      },
    },
    delete_message: 'All tenant resources will be deleted.'
  });
}
