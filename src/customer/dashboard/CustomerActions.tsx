import * as React from 'react';

import { $state } from '@waldur/core/services';
import { ActionList } from '@waldur/dashboard/ActionList';
import { translate } from '@waldur/i18n';

export const CustomerActions = () => (
  <ActionList actions={[
    {
      title: translate('Add project'),
      onClick() {
        $state.go('organization.createProject');
      },
    },
    {
      title: translate('Invite team member'),
      onClick() {
        $state.go('organization.team');
      },
    },
    {
      title: translate('Report issue'),
      onClick() {
        $state.go('organization.issues');
      },
    },
  ]}/>
);
