import * as React from 'react';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import { useDispatch } from 'react-redux';
import { reduxForm, change, arrayPush } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { CUSTOMER_OWNER_ROLE } from '@waldur/core/constants';
import { ENV } from '@waldur/core/services';
import { CustomerPermissionsService } from '@waldur/customer/services/CustomerPermissionsService';
import { CustomersService } from '@waldur/customer/services/CustomersService';
import { ProjectPermissionsService } from '@waldur/customer/services/ProjectPermissionsService';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse } from '@waldur/store/coreSaga';
import { fetchListStart } from '@waldur/table/actions';

import { OwnerExpirationTimeGroup } from './OwnerExpirationTimeGroup';
import { OwnerGroup } from './OwnerGroup';
import { ProjectsListGroup } from './ProjectsListGroup';
import { UserGroup } from './UserGroup';
import './EditTeamMemberDialog.scss';

const FORM_ID = 'EditTeamMemberDialog';

interface Project {
  role: string;
  permission: string;
  expiration_time: string;
  uuid: string;
  name: string;
  url: string;
}

interface EditTeamMemberDialogFormData {
  is_owner: boolean;
  expiration_time: Date;
  projects: Project[];
}

interface EditTeamMemberDialogResolve {
  editUser: any;
  currentCustomer: any;
  currentUser: any;
}

interface EditTeamMemberDialogOwnProps {
  resolve: EditTeamMemberDialogResolve;
}

const savePermissions = async (
  formData: EditTeamMemberDialogFormData,
  resolve: EditTeamMemberDialogResolve,
) => {
  if (resolve.editUser.role && !formData.is_owner) {
    await CustomerPermissionsService.delete(resolve.editUser.permission);
  } else if (!resolve.editUser.role && formData.is_owner) {
    await CustomerPermissionsService.create({
      user: resolve.editUser.url,
      role: CUSTOMER_OWNER_ROLE,
      customer: resolve.currentCustomer.url,
      expiration_time: formData.expiration_time,
    });
  } else if (
    formData.expiration_time !== resolve.editUser.expiration_time &&
    resolve.editUser.permission
  ) {
    await CustomerPermissionsService.update(resolve.editUser.permission, {
      expiration_time: formData.expiration_time,
    });
  }

  const updatePermissions = [],
    createdPermissions = [],
    permissionsToDelete = [];

  (formData.projects || []).forEach((project) => {
    const existingPermission = resolve.editUser.projects.find(
      (p) => p.permission === project.permission,
    );

    if (!existingPermission) {
      if (project.role) {
        createdPermissions.push(project);
      }
    } else if (
      project.role === existingPermission.role &&
      project.expiration_time !== existingPermission.expiration_time
    ) {
      updatePermissions.push(project);
    } else if (
      (!project.role && existingPermission.role) ||
      (project.role &&
        existingPermission.role &&
        project.role !== existingPermission.role)
    ) {
      permissionsToDelete.push(existingPermission.permission);
    }

    if (
      existingPermission &&
      project.role &&
      project.role !== existingPermission.role
    ) {
      createdPermissions.push(project);
    }
  });

  for (const permission of permissionsToDelete) {
    await ProjectPermissionsService.delete(permission);
  }

  for (const permission of updatePermissions) {
    await ProjectPermissionsService.update(permission.permission, {
      role: permission.role,
      expiration_time: permission.expiration_time,
    });
  }

  for (const project of createdPermissions) {
    await ProjectPermissionsService.create({
      user: resolve.editUser.url,
      role: project.role,
      project: project.url,
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

  React.useEffect(() => {
    dispatch(
      change(
        FORM_ID,
        'is_owner',
        resolve.editUser.role === CUSTOMER_OWNER_ROLE,
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
          url: project.url,
          permission: permissionProject ? permissionProject.permission : null,
          role: permissionProject ? permissionProject.role : null,
          expiration_time: permissionProject
            ? permissionProject.expiration_time
            : null,
        }),
      );
    });
  }, [resolve.editUser, resolve.currentCustomer.projects, dispatch]);

  const saveUser = React.useCallback(
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

  const canChangeRole = CustomersService.checkCustomerUser(
    resolve.currentCustomer,
    resolve.currentUser,
  );

  const canManageOwner =
    resolve.currentUser.is_staff ||
    (CustomersService.isOwner(resolve.currentCustomer, resolve.editUser) &&
      CustomersService.isOwner(resolve.currentCustomer, resolve.currentUser) &&
      ENV.plugins.WALDUR_CORE.OWNERS_CAN_MANAGE_OWNERS);

  const projects = React.useMemo(
    () =>
      resolve.currentCustomer.projects.map((project) => {
        const permissionProject = resolve.editUser.projects.find(
          (permissionProject) => permissionProject.uuid === project.uuid,
        );
        return {
          role: permissionProject ? permissionProject.role : null,
          permission: permissionProject ? permissionProject.permission : null,
          expiration_time: permissionProject
            ? permissionProject.expiration_time
            : null,
          uuid: project.uuid,
          name: project.name,
          url: project.url,
        };
      }),
    [resolve.currentCustomer.projects, resolve.editUser.projects],
  );

  return (
    <form onSubmit={handleSubmit(saveUser)} id="edit-team-member-dialog">
      <ModalHeader>
        <ModalTitle>{translate('Edit team member')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <UserGroup editUser={resolve.editUser} />
        <OwnerGroup
          disabled={submitting}
          canChangeRole={canChangeRole}
          canManageOwner={canManageOwner}
        />
        <OwnerExpirationTimeGroup
          disabled={submitting || !canChangeRole || !canManageOwner}
        />
        <ProjectsListGroup canChangeRole={canChangeRole} projects={projects} />
      </ModalBody>
      <ModalFooter>
        <SubmitButton block={false} submitting={submitting}>
          {translate('Save')}
        </SubmitButton>
        <CloseDialogButton />
      </ModalFooter>
    </form>
  );
});
