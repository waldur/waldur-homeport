import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const InviteProjectUserDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "InviteProjectUserDialog" */ './InviteProjectUserDialog'
    ),
  'InviteProjectUserDialog',
);

export const InviteUserToProjectButton: React.FC<{ refreshList }> = ({
  refreshList,
}) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() =>
        dispatch(openModalDialog(InviteProjectUserDialog, { refreshList }))
      }
      title={translate('Invite user')}
      icon="fa fa-plus"
    />
  );
};
