import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { $uibModal } from '@waldur/modal/services';

import { CustomerActionsProps } from './types';
import { checkPermissions } from './utils';

export const getInviteAction = (props: CustomerActionsProps) => {
  if (!checkPermissions(props)) {
    return undefined;
  }
  return {
    title: translate('Invite team member'),
    onClick() {
      $uibModal.open({
        component: 'invitationDialog',
        resolve: {
          context: () => props,
        },
      }).result.then(() => {
        $state.go('organization.team');
      });
    },
  };
};
