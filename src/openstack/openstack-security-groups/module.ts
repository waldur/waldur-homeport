import { lazyComponent } from '@waldur/core/lazyComponent';
import { gettext, translate } from '@waldur/i18n';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { DEFAULT_EDIT_ACTION } from '@waldur/resource/actions/constants';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './breadcrumbs';

const OpenStackSecurityGroupSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackSecurityGroupSummary" */ './OpenStackSecurityGroupSummary'
    ),
  'OpenStackSecurityGroupSummary',
);

import './tabs';

ActionConfigurationRegistry.register('OpenStack.SecurityGroup', {
  order: ['edit', 'set_rules', 'destroy'],
  options: {
    edit: {
      ...DEFAULT_EDIT_ACTION,
      successMessage: gettext('Security group has been updated.'),
      isVisible: (model) => model.name !== 'default',
    },
    destroy: {
      title: gettext('Destroy'),
      isVisible: (model) => model.name !== 'default',
    },
    pull: {
      title: gettext('Synchronise'),
    },
    set_rules: {
      title: gettext('Set rules'),
      getDialogTitle(resource) {
        return translate('Set rules in {name} security group', {
          name: resource.name.toUpperCase(),
        });
      },
      enabled: true,
      type: 'form',
      fields: {
        rules: {
          component: 'securityGroupRuleEditor',
          resource_default_value: true,
        },
      },
      dialogSize: 'xl',
      serializer: (model) =>
        model.rules.map((rule) => ({
          ...rule,
          protocol: rule.protocol === null ? '' : rule.protocol,
        })),
    },
  },
});

ResourceSummary.register(
  'OpenStack.SecurityGroup',
  OpenStackSecurityGroupSummary,
);
