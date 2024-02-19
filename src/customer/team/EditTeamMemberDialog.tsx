import { useEffect, useCallback, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm, change, arrayPush } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import {
  addProjectUser,
  deleteProjectUser,
  updateProjectUser,
  addCustomerUser,
  deleteCustomerUser,
  updateCustomerUser,
} from '@waldur/permissions/api';
import { PermissionEnum, RoleEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ExpirationTimeGroup } from '@waldur/project/team/ExpirationTimeGroup';
import { showErrorResponse } from '@waldur/store/notify';
import { fetchListStart } from '@waldur/table/actions';
import { checkCustomerUser, checkIsOwner } from '@waldur/workspace/selectors';
import { Customer, User } from '@waldur/workspace/types';

import { OwnerGroup } from './OwnerGroup';
import { ProjectsListGroup } from './ProjectsListGroup';
import { UserGroup } from './UserGroup';

import './EditTeamMemberDialog.scss';

const FORM_ID = 'EditTeamMemberDialog';

interface PermissionData {
  role_name: string;
  expiration_time: string;
  uuid: string;
  name: string;
}

interface EditTeamMemberDialogFormData {
  is_owner: boolean;
  expiration_time: string;
  projects: PermissionData[];
}

interface EditUser extends User, PermissionData {
  projects: PermissionData[];
}

interface EditTeamMemberDialogResolve {
  editUser: EditUser;
  currentCustomer: Customer;
  currentUser: User;
}

interface EditTeamMemberDialogOwnProps {
  resolve: EditTeamMemberDialogResolve;
}

const savePermissions = async (
  formData: EditTeamMemberDialogFormData,
  resolve: EditTeamMemberDialogResolve,
) => {
  const permission = {
    customer: resolve.currentCustomer.uuid,
    user: resolve.editUser.uuid,
    role: RoleEnum.CUSTOMER_OWNER,
  };
  if (resolve.editUser.role_name && !formData.is_owner) {
    await deleteCustomerUser(permission);
  } else if (!resolve.editUser.role_name && formData.is_owner) {
    await addCustomerUser({
      ...permission,
      expiration_time: formData.expiration_time,
    });
  } else if (formData.expiration_time !== resolve.editUser.expiration_time) {
    await updateCustomerUser({
      ...permission,
      expiration_time: formData.expiration_time,
    });
  }

  const updatePermissions = [],
    createdPermissions = [],
    permissionsToDelete = [];

  (formData.projects || []).forEach((project) => {
    const existingPermission = resolve.editUser.projects.find(
      (p) => p.uuid === project.uuid,
    );

    if (!existingPermission) {
      if (project.role_name) {
        createdPermissions.push(project);
      }
    } else if (
      project.role_name === existingPermission.role_name &&
      project.expiration_time !== existingPermission.expiration_time
    ) {
      updatePermissions.push(project);
    } else if (
      (!project.role_name && existingPermission.role_name) ||
      (project.role_name &&
        existingPermission.role_name &&
        project.role_name !== existingPermission.role_name)
    ) {
      permissionsToDelete.push(existingPermission);
    }

    if (
      existingPermission &&
      project.role_name &&
      project.role_name !== existingPermission.role_name
    ) {
      createdPermissions.push(project);
    }
  });

  for (const permission of permissionsToDelete) {
    await deleteProjectUser({
      project: permission.uuid,
      user: resolve.editUser.uuid,
      role: permission.role_name,
    });
  }

  for (const permission of updatePermissions) {
    await updateProjectUser({
      project: permission.uuid,
      user: resolve.editUser.uuid,
      role: permission.role_name,
      expiration_time: permission.expiration_time,
    });
  }

  for (const project of createdPermissions) {
    await addProjectUser({
      project: project.uuid,
      user: resolve.editUser.uuid,
      role: project.role_name,
      expiration_time: project.expiration_time,
    });
  }
};

export const EditTeamMemberDialog = reduxForm<
  EditTeamMemberDialogFormData,
  EditTeamMemberDialogOwnProps
>({
  form: FORM_ID,
})(({ submitting, handleSubmit, resolve }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      change(
        FORM_ID,
        'is_owner',
        resolve.editUser.role_name === RoleEnum.CUSTOMER_OWNER,
      ),
    );
    dispatch(
      change(FORM_ID, 'expiration_time', resolve.editUser.expiration_time),
    );
    resolve.currentCustomer.projects.forEach((project) => {
      const permissionProject = resolve.editUser.projects.find(
        (permissionProject) => permissionProject.uuid === project.uuid,
      );
      dispatch(
        arrayPush(FORM_ID, 'projects', {
          uuid: project.uuid,
          role_name: permissionProject ? permissionProject.role_name : null,
          expiration_time: permissionProject
            ? permissionProject.expiration_time
            : null,
        }),
      );
    });
  }, [resolve.editUser, resolve.currentCustomer.projects, dispatch]);

  const saveUser = useCallback(
    async (formData) => {
      try {
        await savePermissions(formData, resolve);
        dispatch(closeModalDialog());
        dispatch(
          fetchListStart('customer-users', {
            customer_uuid: resolve.currentCustomer.uuid,
            o: 'concatenated_name',
          }),
        );
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to update user.')));
      }
    },
    [dispatch, resolve],
  );

  const canChangeRole = checkCustomerUser(
    resolve.currentCustomer,
    resolve.currentUser,
  );

  const canManageOwner =
    resolve.currentUser.is_staff ||
    (checkIsOwner(resolve.currentCustomer, resolve.editUser) &&
      hasPermission(resolve.currentUser, {
        permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
        customerId: resolve.currentCustomer.uuid,
      }));

  const projects = useMemo(
    () =>
      resolve.currentCustomer.projects.map((project) => {
        const permissionProject = resolve.editUser.projects.find(
          (permissionProject) => permissionProject.uuid === project.uuid,
        );
        return {
          role_name: permissionProject ? permissionProject.role_name : null,
          expiration_time: permissionProject
            ? permissionProject.expiration_time
            : null,
          uuid: project.uuid,
          name: project.name,
        };
      }),
    [resolve.currentCustomer.projects, resolve.editUser.projects],
  );

  return (
    <form onSubmit={handleSubmit(saveUser)} id="edit-team-member-dialog">
      <Modal.Header>
        <Modal.Title>{translate('Edit team member')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <UserGroup editUser={resolve.editUser} />
        <OwnerGroup
          disabled={submitting}
          canChangeRole={canChangeRole}
          canManageOwner={canManageOwner}
        />
        <ExpirationTimeGroup
          disabled={submitting || !canChangeRole || !canManageOwner}
        />
        <ProjectsListGroup canChangeRole={canChangeRole} projects={projects} />
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton block={false} submitting={submitting}>
          {translate('Save')}
        </SubmitButton>
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
