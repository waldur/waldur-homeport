import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';

import { CustomerActionsProps } from './types';
import { checkPermissions } from './utils';

const InvitationCreateDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "InvitationCreateDialog" */ '@waldur/invitations/actions/InvitationCreateDialog'
    ),
  'InvitationCreateDialog',
);

export const getInviteAction = (props: CustomerActionsProps) => {
  if (!checkPermissions(props)) {
    return undefined;
  }
  return {
    title: translate('Invite team member'),
    onClick() {
      store.dispatch(
        openModalDialog(InvitationCreateDialog, {
          resolve: { context: props },
        }),
      );
    },
  };
};
