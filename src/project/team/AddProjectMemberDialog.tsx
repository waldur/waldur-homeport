import { useCallback, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';
import { reduxForm, change } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { PROJECT_ADMIN_ROLE } from '@waldur/core/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { CustomersService } from '@waldur/customer/services/CustomersService';
import { ProjectPermissionsService } from '@waldur/customer/services/ProjectPermissionsService';
import { FormContainer } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse } from '@waldur/store/notify';

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
  refreshList;
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
  resolve.refreshList();
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

  const saveUser = useCallback(
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

  useEffect(() => {
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

  useEffect(() => {
    if (users) {
      dispatch(change(FORM_ID, 'role', PROJECT_ADMIN_ROLE));
    }
  }, [dispatch, users]);

  return (
    <form onSubmit={handleSubmit(saveUser)}>
      <Modal.Header>
        <Modal.Title>
          {resolve.editUser
            ? translate('Edit project member')
            : translate('Add project member')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <FormContainer submitting={submitting}>
            <UserGroup
              customerUuid={resolve.currentCustomer.uuid}
              editUser={resolve.editUser}
              users={users}
              disabled={submitting}
            />
            <RoleGroup isProjectManager={resolve.isProjectManager} />
            <ExpirationTimeGroup disabled={submitting} />
          </FormContainer>
        )}
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton block={false} submitting={submitting}>
          {resolve.editUser ? translate('Save') : translate('Add')}
        </SubmitButton>
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
