import { translate } from '@waldur/i18n';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { angular2react } from '@waldur/shims/angular2react';

import breadcrumbsConfig from './breadcrumbs';
import filtersModule from './filters';
import securityGroupsDialogReact from './OpenStackSecurityGroupsDialog';
import { OpenStackSecurityGroupSummary } from './OpenStackSecurityGroupSummary';
import securityGroupRuleEditor from './security-group-rule-editor';
import securityGroupRulesList from './security-group-rules-list';
import securityGroupsDialog from './security-groups-dialog';

const SecurityGroupRulesList = angular2react('securityGroupRulesList', [
  'resource',
]);

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('OpenStack.SecurityGroup', () => [
    {
      key: 'rules',
      title: translate('Rules'),
      component: SecurityGroupRulesList,
    },
    getEventsTab(),
  ]);
}

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStack.SecurityGroup', {
    order: ['edit', 'set_rules', 'destroy'],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: gettext('Security group has been updated.'),
        isVisible: model => model.name !== 'default',
      }),
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
}

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
  module.config(tabsConfig);
  module.config(actionConfig);
  module.run(breadcrumbsConfig);
};
