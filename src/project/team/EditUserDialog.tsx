import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch, useSelector } from 'react-redux';
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
import { GenericPermission, Role } from '@waldur/permissions/types';
import { getProjectRoles } from '@waldur/permissions/utils';
import { showErrorResponse } from '@waldur/store/notify';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { ExpirationTimeGroup } from './ExpirationTimeGroup';
import { RoleGroup } from './RoleGroup';
import { UserGroup } from './UserGroup';

const FORM_ID = 'EditUserDialog';

interface EditUserDialogFormData {
  role: Role;
  expiration_time: string;
  user: any;
}

interface EditUserDialogResolve {
  permission: GenericPermission;
  refetch;
}

interface EditUserDialogOwnProps {
  resolve: EditUserDialogResolve;
}

const savePermissions = async (
  project: Project,
  formData: EditUserDialogFormData,
  resolve: EditUserDialogResolve,
) => {
  if (resolve.permission) {
    if (resolve.permission.role_name === formData.role.name) {
      await updateProjectUser({
        project: project.uuid,
        user: resolve.permission.user_uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      });
    } else {
      await deleteProjectUser({
        project: project.uuid,
        user: resolve.permission.user_uuid,
        role: resolve.permission.role_name,
      });
      await addProjectUser({
        project: project.uuid,
        user: resolve.permission.user_uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      });
    }
  }
  await resolve.refetch();
};

export const EditUserDialog = connect(
  (_, ownProps: EditUserDialogOwnProps) => ({
    initialValues: {
      role: getProjectRoles().find(
        ({ name }) => name === ownProps.resolve.permission.role_name,
      ),
      expiration_time: ownProps.resolve.permission.expiration_time,
    },
  }),
)(
  reduxForm<EditUserDialogFormData, EditUserDialogOwnProps>({
    form: FORM_ID,
  })(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();
    const currentProject = useSelector(getProject);

    const saveUser = useCallback(
      async (formData) => {
        try {
          await savePermissions(currentProject, formData, resolve);
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
            <UserGroup permission={resolve.permission} />
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
