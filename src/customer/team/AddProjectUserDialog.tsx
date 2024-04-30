import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { addProjectUser } from '@waldur/permissions/api';
import { Role } from '@waldur/permissions/types';
import { ExpirationTimeGroup } from '@waldur/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@waldur/project/team/RoleGroup';
import { showErrorResponse } from '@waldur/store/notify';
import { Project } from '@waldur/workspace/types';

import { OrganizationProjectSelectField } from './OrganizationProjectSelectField';
import { NestedCustomerPermission } from './types';
import { UserGroup } from './UserGroup';

const FORM_ID = 'AddProjectUserDialog';

interface AddProjectUserDialogFormData {
  role: Role;
  expiration_time: string;
  project: Project;
}

interface AddProjectUserDialogResolve {
  customer: NestedCustomerPermission;
  refetch;
}

interface AddProjectUserDialogOwnProps {
  resolve: AddProjectUserDialogResolve;
}

const savePermissions = async (
  formData: AddProjectUserDialogFormData,
  resolve: AddProjectUserDialogResolve,
) => {
  await addProjectUser({
    project: formData.project.uuid,
    user: resolve.customer.uuid,
    role: formData.role.name,
    expiration_time: formData.expiration_time,
  });
  await resolve.refetch();
};

export const AddProjectUserDialog = reduxForm<
  AddProjectUserDialogFormData,
  AddProjectUserDialogOwnProps
>({
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
          <OrganizationProjectSelectField />
          <RoleGroup types={['project']} />
          <ExpirationTimeGroup disabled={submitting} />
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton submitting={submitting}>{translate('Save')}</SubmitButton>
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
