import * as React from 'react';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import { useDispatch } from 'react-redux';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { reduxForm, change } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { PROJECT_ADMIN_ROLE } from '@waldur/core/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { CustomersService } from '@waldur/customer/services/CustomersService';
import { ProjectPermissionsService } from '@waldur/customer/services/ProjectPermissionsService';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse } from '@waldur/store/coreSaga';

import { ExpirationTimeGroup } from './ExpirationTimeGroup';
import { RoleGroup } from './RoleGroup';
import { UserGroup } from './UserGroup';

const FORM_ID = 'AddProjectMemberDialog';

interface AddProjectMemberDialogFormData {
  role: string;
  expiration_time: string;
  user: any;
}

interface AddProjectMemberDialogResolve {
  addedUsers: any;
  editUser: any;
  currentCustomer: any;
  currentProject: any;
  isProjectManager: boolean;
}

interface AddProjectMemberDialogOwnProps {
  resolve: AddProjectMemberDialogResolve;
}

const savePermissions = async (
  formData: AddProjectMemberDialogFormData,
  resolve: AddProjectMemberDialogResolve,
) => {
  if (resolve.editUser) {
    if (resolve.editUser.role === formData.role) {
      await ProjectPermissionsService.update(resolve.editUser.permission, {
        expiration_time: formData.expiration_time,
      });
    } else {
      await ProjectPermissionsService.delete(resolve.editUser.permission);
      await ProjectPermissionsService.create({
        user: formData.user.url,
        project: resolve.currentProject.url,
        expiration_time: formData.expiration_time,
        role: formData.role,
      });
    }
  } else if (formData.user) {
    await ProjectPermissionsService.create({
      user: formData.user.url,
      project: resolve.currentProject.url,
      expiration_time: formData.expiration_time,
      role: formData.role,
    });
  }
};

const loadValidUsers = (resolve: AddProjectMemberDialogResolve) =>
  CustomersService.getUsers(resolve.currentCustomer.uuid).then((users) => {
    return users.filter((user) => {
      return resolve.addedUsers.indexOf(user.uuid) === -1;
    });
  });

export const AddProjectMemberDialog = reduxForm<
  AddProjectMemberDialogFormData,
  AddProjectMemberDialogOwnProps
>({
  form: FORM_ID,
})(({ submitting, handleSubmit, resolve }) => {
  const [{ loading, value: users }, callback] = useAsyncFn(
    () => loadValidUsers(resolve),
    [resolve],
  );

  const dispatch = useDispatch();

  const saveUser = React.useCallback(
    async (formData) => {
      try {
        await savePermissions(formData, resolve);
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to update user.')));
      }
    },
    [dispatch, resolve],
  );

  React.useEffect(() => {
    if (resolve.editUser) {
      dispatch(change(FORM_ID, 'user', resolve.editUser));
      dispatch(change(FORM_ID, 'role', resolve.editUser.role));
      dispatch(
        change(FORM_ID, 'expiration_time', resolve.editUser.expiration_time),
      );
    } else {
      callback();
    }
  }, [dispatch, resolve.editUser, callback]);

  React.useEffect(() => {
    if (users) {
      dispatch(change(FORM_ID, 'role', PROJECT_ADMIN_ROLE));
    }
  }, [dispatch, users]);

  return (
    <form onSubmit={handleSubmit(saveUser)}>
      <ModalHeader>
        <ModalTitle>
          {resolve.editUser
            ? translate('Edit project member')
            : translate('Add project member')}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <UserGroup
              editUser={resolve.editUser}
              users={users}
              disabled={submitting}
            />
            <RoleGroup isProjectManager={resolve.isProjectManager} />
            <ExpirationTimeGroup disabled={submitting} />
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <SubmitButton block={false} submitting={submitting}>
          {resolve.editUser ? translate('Save') : translate('Add')}
        </SubmitButton>
        <CloseDialogButton />
      </ModalFooter>
    </form>
  );
});
