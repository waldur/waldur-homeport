import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { User, Project, Customer } from '@waldur/workspace/types';

const AddProjectMemberDialog = lazyComponent(
  () => import('./AddProjectMemberDialog'),
  'AddProjectMemberDialog',
);

interface AddMemberButtonProps {
  users: User[];
  user?: User;
  project: Project;
  customer: Customer;
  refetch;
}

export const AddMemberButton: React.FC<AddMemberButtonProps> = ({
  users,
  user,
  project,
  customer,
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(AddProjectMemberDialog, {
        resolve: {
          currentProject: project,
          currentCustomer: customer,
          editUser: user,
          addedUsers: users.map((user) => user.uuid),
          refetch,
        },
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={user ? translate('Edit') : translate('Add member')}
      icon={user ? 'fa fa-pencil' : 'fa fa-plus'}
    />
  );
};
