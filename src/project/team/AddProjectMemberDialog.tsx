import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import {
  addProjectUser,
  deleteProjectUser,
  updateProjectUser,
} from '@waldur/permissions/api';
import { Role } from '@waldur/permissions/types';
import { getProjectRoles } from '@waldur/permissions/utils';
import { showErrorResponse } from '@waldur/store/notify';

import { ExpirationTimeGroup } from './ExpirationTimeGroup';
import { RoleGroup } from './RoleGroup';
import { UserGroup } from './UserGroup';

const FORM_ID = 'AddProjectMemberDialog';

interface AddProjectMemberDialogFormData {
  role: Role;
  expiration_time: string;
  user: any;
}

interface AddProjectMemberDialogResolve {
  editUser: { role_name: string; user_uuid: string; expiration_time: string };
  currentCustomer: any;
  currentProject: any;
  refetch;
}

interface AddProjectMemberDialogOwnProps {
  resolve: AddProjectMemberDialogResolve;
}

const savePermissions = async (
  formData: AddProjectMemberDialogFormData,
  resolve: AddProjectMemberDialogResolve,
) => {
  if (resolve.editUser) {
    if (resolve.editUser.role_name === formData.role.name) {
      await updateProjectUser({
        project: resolve.currentProject.uuid,
        user: resolve.editUser.user_uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      });
    } else {
      await deleteProjectUser({
        project: resolve.currentProject.uuid,
        user: resolve.editUser.user_uuid,
        role: resolve.editUser.role_name,
      });
      await addProjectUser({
        project: resolve.currentProject.uuid,
        user: resolve.editUser.user_uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      });
    }
  } else if (formData.user) {
    await addProjectUser({
      project: resolve.currentProject.uuid,
      user: formData.user.uuid,
      role: formData.role.name,
      expiration_time: formData.expiration_time,
    });
  }
  resolve.refetch();
};

export const AddProjectMemberDialog = connect(
  (_, ownProps: AddProjectMemberDialogOwnProps) => {
    const editUser = ownProps.resolve?.editUser;
    if (editUser) {
      return {
        initialValues: {
          role: getProjectRoles().find(
            ({ name }) => name === editUser.role_name,
          ),
          expiration_time: editUser.expiration_time,
        },
      };
    }
  },
)(
  reduxForm<AddProjectMemberDialogFormData, AddProjectMemberDialogOwnProps>({
    form: FORM_ID,
  })(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();

    const saveUser = useCallback(
      async (formData) => {
        try {
          await savePermissions(formData, resolve);
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update user.')),
          );
        }
      },
      [dispatch, resolve],
    );

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
          <FormContainer submitting={submitting}>
            <UserGroup
              customerUuid={resolve.currentCustomer.uuid}
              editUser={resolve.editUser}
              disabled={submitting}
            />
            <RoleGroup />
            <ExpirationTimeGroup disabled={submitting} />
          </FormContainer>
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton block={false} submitting={submitting}>
            {resolve.editUser ? translate('Save') : translate('Add')}
          </SubmitButton>
          <CloseDialogButton />
        </Modal.Footer>
      </form>
    );
  }),
);
