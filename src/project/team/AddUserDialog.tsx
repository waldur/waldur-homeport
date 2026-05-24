import { UserPlusIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  callManagingOrganisationsAddUser,
  customersAddUser,
  customersUsersList,
  marketplaceServiceProvidersAddUser,
  projectsAddUser,
  projectsOtherUsersList,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { OrganizationProjectSelectField } from '@/customer/team/OrganizationProjectSelectField';
import { usersAutocomplete } from '@/customer/team/utils';
import { SubmitButton } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { createLoadOptions } from '@/form/select';
import { AsyncSelectField } from '@/form/select/AsyncSelectField';
import { translate } from '@/i18n';
import { RestrictionsInfoCard } from '@/invitations/actions/RestrictionsInfoCard';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { Role, RoleType } from '@/permissions/types';
import { useNotify } from '@/store/notify';
import { getCurrentUser } from '@/user/UsersService';
import { setCurrentUser } from '@/workspace/actions';
import { useUser, useCustomer, useProject } from '@/workspace/hooks';
import { Project, User } from '@/workspace/types';

import { ExpirationTimeGroup } from './ExpirationTimeGroup';
import { RoleGroup } from './RoleGroup';
import { UserListOptionInline } from './UserListOptionInline';
import { hasCurrentCustomerPermission } from './utils';

interface AddUserDialogFormData {
  role: Role;
  expiration_time: string;
  user: any;
  project?: Project;
  showAllUsers?: boolean;
}

interface AddUserDialogProps {
  refetch;
  level?: RoleType;
  title?: string;
  project?: Project;
  customerUuid?: string;
  customer?;
}

const customerUsersAutocomplete = (customerUuid: string) =>
  createLoadOptions(
    customersUsersList,
    'user_keyword',
    { o: 'concatenated_name' },
    { customer_uuid: customerUuid },
  );

const projectUsersAutocomplete = (projectUuid: string) =>
  createLoadOptions(
    projectsOtherUsersList,
    'user_keyword',
    {},
    { project_uuid: projectUuid },
  );

export const AddUserDialog: FC<AddUserDialogProps> = ({
  refetch,
  level,
  title,
  project,
  customerUuid,
  customer,
}) => {
  const dispatch = useDispatch();
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const currentUser = useUser() as User;
  const currentProject = useProject();
  const currentCustomer = useCustomer();
  const hasCustomerPermission = useSelector(hasCurrentCustomerPermission);

  const resolvedProject = project || currentProject;
  const resolvedCustomer = customer || currentCustomer;
  const resolvedCustomerUuid = customerUuid || resolvedCustomer?.uuid;

  const loadUsers = useCallback(
    async (query, prevOptions, page, showAllUsers: boolean) => {
      try {
        if (showAllUsers) {
          return await usersAutocomplete(query, prevOptions, page);
        }

        if (hasCustomerPermission || !resolvedProject) {
          return await customerUsersAutocomplete(resolvedCustomerUuid)(
            query,
            prevOptions,
            page,
          );
        }

        return await projectUsersAutocomplete(resolvedProject.uuid)(
          query,
          prevOptions,
          page,
        );
      } catch (error) {
        showErrorResponse(error, translate('Unable to load users.'));
        return {
          options: [],
          hasMore: false,
          additional: { page: 1 },
        };
      }
    },
    [hasCustomerPermission, resolvedProject, resolvedCustomerUuid],
  );

  const getOptionLabel = (option) =>
    option.email
      ? (option.full_name || option.username) + ` (${option.email})`
      : option.full_name || option.username;

  const saveUser = useCallback(
    async (formData: AddUserDialogFormData) => {
      if (formData.role.content_type === 'project') {
        try {
          const targetProjectUuid =
            formData.project?.uuid || resolvedProject?.uuid;
          await projectsAddUser({
            path: {
              uuid: targetProjectUuid,
            },
            body: {
              user: formData.user.uuid,
              expiration_time: formData.expiration_time,
              role: formData.role.name,
            },
          });
          await refetch();
          showSuccess(translate('User has been added to project.'));
          closeDialog();
        } catch (error) {
          showErrorResponse(error, translate('Unable to add user.'));
        }
      } else if (formData.role.content_type === 'customer') {
        try {
          await customersAddUser({
            path: { uuid: resolvedCustomerUuid },
            body: {
              user: formData.user.uuid,
              role: formData.role.name,
              expiration_time: formData.expiration_time,
            },
          });
          if (currentUser.uuid === formData.user.uuid) {
            const newUser = await getCurrentUser();
            dispatch(setCurrentUser(newUser));
          }
          await refetch();
          showSuccess(translate('User has been added to organization.'));
          closeDialog();
        } catch (error) {
          showErrorResponse(error, translate('Unable to add user.'));
        }
      } else if (formData.role.content_type === 'call_organizer') {
        try {
          await callManagingOrganisationsAddUser({
            path: { uuid: resolvedCustomer.call_managing_organization_uuid },
            body: {
              user: formData.user.uuid,
              role: formData.role.name,
              expiration_time: formData.expiration_time,
            },
          });
          if (currentUser.uuid === formData.user.uuid) {
            const newUser = await getCurrentUser();
            dispatch(setCurrentUser(newUser));
          }
          await refetch();
          showSuccess(translate('User has been added to organization.'));
          closeDialog();
        } catch (error) {
          showErrorResponse(error, translate('Unable to add user.'));
        }
      } else if (formData.role.content_type === 'service_provider') {
        try {
          await marketplaceServiceProvidersAddUser({
            path: { uuid: resolvedCustomer.service_provider_uuid },
            body: {
              user: formData.user.uuid,
              role: formData.role.name,
              expiration_time: formData.expiration_time,
            },
          });
          if (currentUser.uuid === formData.user.uuid) {
            const newUser = await getCurrentUser();
            dispatch(setCurrentUser(newUser));
          }
          await refetch();
          showSuccess(translate('User has been added to organization.'));
          closeDialog();
        } catch (error) {
          showErrorResponse(error, translate('Unable to add user.'));
        }
      }
    },
    [
      refetch,
      showSuccess,
      closeDialog,
      showErrorResponse,
      resolvedProject,
      resolvedCustomer,
      currentUser,
    ],
  );

  return (
    <Form onSubmit={saveUser}>
      {({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={title || translate('Add user')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton submitting={submitting} disabled={invalid}>
                  {translate('Add role')}
                </SubmitButton>
              </>
            }
            iconNode={<UserPlusIcon weight="bold" />}
            iconColor="success"
          >
            <RestrictionsInfoCard
              customer={resolvedCustomer}
              project={
                level === 'project' ? resolvedProject : values.project || null
              }
            />
            <FormGroup label={translate('User')} required>
              <AsyncSelectField
                name="user"
                key={values.showAllUsers ? 'showAllUsers' : 'notShowAllUsers'}
                placeholder={translate('Select user...')}
                loadOptions={(query, prevOptions, page) =>
                  loadUsers(
                    query,
                    prevOptions,
                    page,
                    values.showAllUsers || false,
                  )
                }
                getOptionValue={(option) => option.uuid}
                getOptionLabel={getOptionLabel}
                components={{ Option: UserListOptionInline }}
                noOptionsMessage={() =>
                  translate(
                    'No users found. You can only see users from projects you belong to. Use "Invite by mail" to add new users.',
                  )
                }
                required={true}
                validate={required}
              />
            </FormGroup>

            {currentUser.is_staff && (
              <FormGroup>
                <Field
                  name="showAllUsers"
                  component={AwesomeCheckboxField}
                  label={translate('Show users outside organization')}
                />
              </FormGroup>
            )}
            <RoleGroup
              types={
                level === 'customer' &&
                hasPermission(currentUser, {
                  permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
                  customerId: resolvedCustomerUuid,
                })
                  ? ['customer', 'project']
                  : [level]
              }
            />

            {level === 'customer' &&
              values.role?.content_type === 'project' && (
                <OrganizationProjectSelectField />
              )}
            <ExpirationTimeGroup />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
