import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { AddProjectMemberDialog } from '@waldur/project/team/AddProjectMemberDialog';
import { ActionButton } from '@waldur/table/ActionButton';
import { User, Project, Customer } from '@waldur/workspace/types';

interface AddMemberButtonProps {
  users: User[];
  user?: User;
  project: Project;
  customer: Customer;
  isProjectManager: boolean;
  refreshList;
}

export const AddMemberButton: React.FC<AddMemberButtonProps> = ({
  users,
  user,
  project,
  customer,
  isProjectManager,
  refreshList,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(AddProjectMemberDialog, {
        resolve: {
          currentProject: project,
          currentCustomer: customer,
          editUser: user,
          isProjectManager: isProjectManager,
          addedUsers: users.map((user) => user.uuid),
          refreshList,
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
