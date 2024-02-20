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
import { ExpirationTimeGroup } from '@waldur/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@waldur/project/team/RoleGroup';
import { showErrorResponse } from '@waldur/store/notify';

import { ProjectGroup } from './ProjectGroup';
import { NestedCustomerPermission, NestedProjectPermission } from './types';
import { UserGroup } from './UserGroup';

const FORM_ID = 'EditProjectUserDialog';

interface EditProjectUserDialogFormData {
  role: Role;
  expiration_time: string;
}

interface EditProjectUserDialogResolve {
  project: NestedProjectPermission;
  customer: NestedCustomerPermission;
  refetch;
}

interface EditProjectUserDialogOwnProps {
  resolve: EditProjectUserDialogResolve;
}

const savePermissions = async (
  formData: EditProjectUserDialogFormData,
  resolve: EditProjectUserDialogResolve,
) => {
  if (resolve.project.role_name === formData.role.name) {
    await updateProjectUser({
      project: resolve.project.uuid,
      user: resolve.customer.uuid,
      role: formData.role.name,
      expiration_time: formData.expiration_time,
    });
  } else {
    await deleteProjectUser({
      project: resolve.project.uuid,
      user: resolve.customer.uuid,
      role: resolve.project.role_name,
    });
    await addProjectUser({
      project: resolve.project.uuid,
      user: resolve.customer.uuid,
      role: formData.role.name,
      expiration_time: formData.expiration_time,
    });
  }
  await resolve.refetch();
};

export const EditProjectUserDialog = connect(
  (_, ownProps: EditProjectUserDialogOwnProps) => ({
    initialValues: {
      role: getProjectRoles().find(
        ({ name }) => name === ownProps.resolve.project.role_name,
      ),
      expiration_time: ownProps.resolve.project.expiration_time,
    },
  }),
)(
  reduxForm<EditProjectUserDialogFormData, EditProjectUserDialogOwnProps>({
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
            showErrorResponse(error, translate('Unable to update permission.')),
          );
        }
      },
      [dispatch, resolve],
    );

    return (
      <form onSubmit={handleSubmit(saveUser)}>
        <Modal.Header>
          <Modal.Title>{translate('Edit project member')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormContainer submitting={submitting}>
            <UserGroup permission={resolve.customer} />
            <ProjectGroup project={resolve.project} />
            <RoleGroup types={['project']} />
            <ExpirationTimeGroup disabled={submitting} />
          </FormContainer>
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton block={false} submitting={submitting}>
            {translate('Save')}
          </SubmitButton>
          <CloseDialogButton />
        </Modal.Footer>
      </form>
    );
  }),
);
