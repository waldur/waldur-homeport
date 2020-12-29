import { lazyComponent } from '@waldur/core/lazyComponent';
import { gettext } from '@waldur/i18n';
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

const SecurityGroupEditorDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SecurityGroupEditorDialog" */ './SecurityGroupEditorDialog'
    ),
  'SecurityGroupEditorDialog',
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
      component: SecurityGroupEditorDialog,
      enabled: true,
      type: 'form',
      dialogSize: 'xl',
    },
  },
});

ResourceSummary.register(
  'OpenStack.SecurityGroup',
  OpenStackSecurityGroupSummary,
);
