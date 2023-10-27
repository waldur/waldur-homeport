import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isProjectManagerSelector,
} from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

const InvitationCreateDialog = lazyComponent(
  () => import('./InvitationCreateDialog'),
  'InvitationCreateDialog',
);

export const InvitationCreateButton: FunctionComponent<{
  refetch(): void;
  project?: Project;
}> = ({ refetch, project }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isProjectManager = isProjectManagerSelector(user, project);
  const isAllowed = isOwnerOrStaff || isProjectManager;
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(InvitationCreateDialog, {
        size: 'xl',
        resolve: {
          context: {
            customer,
            user,
            refetch,
            project,
          },
        },
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Invite user')}
      icon="fa fa-plus"
      variant="primary"
      disabled={!isAllowed}
      tooltip={!isAllowed && translate('You can not invite users.')}
    />
  );
};
