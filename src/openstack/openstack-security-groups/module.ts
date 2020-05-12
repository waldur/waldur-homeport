import { gettext } from '@waldur/i18n';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { DEFAULT_EDIT_ACTION } from '@waldur/resource/actions/constants';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './breadcrumbs';
import filtersModule from './filters';
import securityGroupsDialogReact from './OpenStackSecurityGroupsDialog';
import { OpenStackSecurityGroupSummary } from './OpenStackSecurityGroupSummary';
import securityGroupRuleEditor from './security-group-rule-editor';
import securityGroupRulesList from './security-group-rules-list';
import securityGroupsDialog from './security-groups-dialog';

import './tabs';

ActionConfigurationRegistry.register('OpenStack.SecurityGroup', {
  order: ['edit', 'set_rules', 'destroy'],
  options: {
    edit: {
      ...DEFAULT_EDIT_ACTION,
      successMessage: gettext('Security group has been updated.'),
      isVisible: model => model.name !== 'default',
    },
    destroy: {
      title: gettext('Destroy'),
      isVisible: model => model.name !== 'default',
    },
    pull: {
      title: gettext('Synchronise'),
    },
    set_rules: {
      title: gettext('Set rules'),
      enabled: true,
      type: 'form',
      fields: {
        rules: {
          component: 'securityGroupRuleEditor',
          resource_default_value: true,
        },
      },
      dialogSize: 'lg',
      serializer: model =>
        model.rules.map(rule => ({
          ...rule,
          protocol: rule.protocol === null ? '' : rule.protocol,
        })),
    },
  },
});

export default module => {
  ResourceSummary.register(
    'OpenStack.SecurityGroup',
    OpenStackSecurityGroupSummary,
  );
  module.component('securityGroupRulesList', securityGroupRulesList);
  module.component('securityGroupRuleEditor', securityGroupRuleEditor);
  module.component('securityGroupsDialog', securityGroupsDialog);
  module.component('securityGroupsDialogReact', securityGroupsDialogReact);
  filtersModule(module);
};
