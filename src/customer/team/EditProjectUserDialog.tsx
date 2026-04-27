import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  CustomerUser,
  NestedProjectPermission,
  projectsAddUser,
  projectsDeleteUser,
  projectsUpdateUser,
} from 'waldur-js-client';

import { FormContainer, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { Role } from '@/permissions/types';
import { getProjectRoles } from '@/permissions/utils';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@/project/team/RoleGroup';
import { showErrorResponse } from '@/store/notify';

import { ProjectGroup } from './ProjectGroup';
import { UserGroup } from './UserGroup';

const FORM_ID = 'EditProjectUserDialog';

interface EditProjectUserDialogFormData {
  role: Role;
  expiration_time: string;
}

interface EditProjectUserDialogResolve {
  project: NestedProjectPermission;
  customer: CustomerUser;
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
    await projectsUpdateUser({
      path: { uuid: resolve.project.uuid },
      body: {
        user: resolve.customer.uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      },
    });
  } else {
    await projectsDeleteUser({
      path: { uuid: resolve.project.uuid },
      body: {
        user: resolve.customer.uuid,
        role: resolve.project.role_name,
      },
    });
    await projectsAddUser({
      path: { uuid: resolve.project.uuid },
      body: {
        user: resolve.customer.uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      },
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
        <ModalDialog
          title={translate('Edit project member')}
          footer={
            <>
              <CloseDialogButton />
              <SubmitButton submitting={submitting}>
                {translate('Save')}
              </SubmitButton>
            </>
          }
        >
          <FormContainer submitting={submitting}>
            <UserGroup permission={resolve.customer} />
            <ProjectGroup project={resolve.project} />
            <RoleGroup types={['project']} legacyField />
            <ExpirationTimeGroup disabled={submitting} legacyField />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
