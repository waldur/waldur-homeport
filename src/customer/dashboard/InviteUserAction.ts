import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';

import { CustomerActionsProps } from './types';
import { checkPermissions } from './utils';

export const getInviteAction = (props: CustomerActionsProps) => {
  if (!checkPermissions(props)) {
    return undefined;
  }
  return {
    title: translate('Invite team member'),
    onClick() {
      store.dispatch(
        openModalDialog('invitationDialog', {
          resolve: { context: props },
        }),
      );
    },
  };
};
