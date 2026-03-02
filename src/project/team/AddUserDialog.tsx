import { UserPlusIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  callManagingOrganisationsAddUser,
  customersAddUser,
  customersUsersList,
  CustomersUsersListData,
  marketplaceServiceProvidersAddUser,
  projectsAddUser,
  projectsOtherUsersList,
  ProjectsOtherUsersListData,
} from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { OrganizationProjectSelectField } from '@waldur/customer/team/OrganizationProjectSelectField';
import { usersAutocomplete } from '@waldur/customer/team/utils';
import { SubmitButton } from '@waldur/form';
import { AsyncSelectFieldFinal } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { RestrictionsInfoCard } from '@waldur/invitations/actions/RestrictionsInfoCard';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { Role, RoleType } from '@waldur/permissions/types';
import { useNotify } from '@waldur/store/hooks';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Project, User } from '@waldur/workspace/types';

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

const customerUsersAutocomplete = async (
  customerUuid: string,
  query: CustomersUsersListData['query'],
  prevOptions,
  currentPage: number,
) => {
  const response = await customersUsersList({
    path: { customer_uuid: customerUuid },
    query: {
      o: 'concatenated_name',
      ...query,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

const projectUsersAutocomplete = async (
  projectUuid: string,
  query: ProjectsOtherUsersListData['query'],
  prevOptions,
  currentPage: number,
) => {
  const response = await projectsOtherUsersList({
    path: { project_uuid: projectUuid },
    query: {
      ...query,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

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
  const currentProject = useSelector(getProject);
  const currentCustomer = useSelector(getCustomer);
  const hasCustomerPermission = useSelector(hasCurrentCustomerPermission);

  const resolvedProject = project || currentProject;
  const resolvedCustomer = customer || currentCustomer;
  const resolvedCustomerUuid = customerUuid || resolvedCustomer?.uuid;

  const loadUsers = useCallback(
    async (query, prevOptions, page, showAllUsers: boolean) => {
      try {
        if (showAllUsers) {
          return await usersAutocomplete({ query }, prevOptions, page);
        }

        if (hasCustomerPermission || !resolvedProject) {
          return await customerUsersAutocomplete(
            resolvedCustomerUuid,
            { user_keyword: query },
            prevOptions,
            page,
          );
        }

        return await projectUsersAutocomplete(
          resolvedProject.uuid,
          { user_keyword: query },
          prevOptions,
          page,
        );
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to load users.')));
        return {
          options: [],
          hasMore: false,
          additional: { page: 1 },
        };
      }
    },
    [dispatch, hasCustomerPermission, resolvedProject, resolvedCustomerUuid],
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
      dispatch,
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
              <AsyncSelectFieldFinal
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
                  component={AwesomeCheckboxField as any}
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
