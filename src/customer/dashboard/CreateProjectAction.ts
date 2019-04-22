import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { CustomerActionsProps } from './types';
import { checkPermissions } from './utils';

export const getProjectAction = (props: CustomerActionsProps) => {
  if (!checkPermissions(props)) {
    return undefined;
  }
  return {
    title: translate('Add project'),
    onClick() {
      $state.go('organization.createProject');
    },
  };
};
