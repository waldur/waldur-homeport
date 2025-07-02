import { UserPlusIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector, reduxForm } from 'redux-form';
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

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { OrganizationProjectSelectField } from '@waldur/customer/team/OrganizationProjectSelectField';
import { usersAutocomplete } from '@waldur/customer/team/utils';
import { FormContainer } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { Role, RoleType } from '@waldur/permissions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { type RootState } from '@waldur/store/reducers';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Project, User } from '@waldur/workspace/types';

import { ExpirationTimeGroup } from './ExpirationTimeGroup';
import { RoleGroup } from './RoleGroup';
import { UserListOptionInline } from './UserListOptionInline';
import { hasCurrentCustomerPermission } from './utils';

const FORM_ID = 'AddUserDialog';
const FIELD_ID = 'showAllUsers';

interface AddUserDialogFormData {
  role: Role;
  expiration_time: string;
  user: any;
  project?: Project;
}

interface AddUserDialogProps {
  refetch;
  level?: RoleType;
  title?: string;
}

const customerUsersAutocomplete = async (
  customerUuid: string,
  query: CustomersUsersListData['query'],
  prevOptions,
  currentPage: number,
) => {
  const response = await customersUsersList({
    path: { uuid: customerUuid },
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
    path: { uuid: projectUuid },
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

const showAllUsersSelector = (state: RootState) =>
  formValueSelector(FORM_ID)(state, FIELD_ID);

const roleSelector = (state: RootState) =>
  formValueSelector(FORM_ID)(state, 'role');

export const AddUserDialog = reduxForm<
  AddUserDialogFormData,
  AddUserDialogProps
>({
  form: FORM_ID,
})(({ submitting, handleSubmit, refetch, invalid, level, title }) => {
  const dispatch = useDispatch();

  const currentUser = useUser() as User;
  const currentProject = useSelector(getProject);
  const currentCustomer = useSelector(getCustomer);
  const hasCustomerPermission = useSelector(hasCurrentCustomerPermission);

  const loadUsers = async (query, prevOptions, page) => {
    try {
      if (showAllUsers) {
        return await usersAutocomplete({ query }, prevOptions, page);
      }

      if (hasCustomerPermission || !currentProject) {
        return await customerUsersAutocomplete(
          currentCustomer.uuid,
          { user_keyword: query },
          prevOptions,
          page,
        );
      }

      return await projectUsersAutocomplete(
        currentProject.uuid,
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
  };

  const getOptionLabel = (option) =>
    option.email
      ? (option.full_name || option.username) + ` (${option.email})`
      : option.full_name || option.username;

  const saveUser = async (formData: AddUserDialogFormData) => {
    if (formData.role.content_type === 'project') {
      try {
        await projectsAddUser({
          path: {
            uuid: formData.project
              ? formData.project.uuid
              : currentProject.uuid,
          },
          body: {
            user: formData.user.uuid,
            expiration_time: formData.expiration_time,
            role: formData.role.name,
          },
        });
        await refetch();
        dispatch(showSuccess('User has been added to project.'));
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to add user.')));
      }
    } else if (formData.role.content_type === 'customer') {
      try {
        await customersAddUser({
          path: { uuid: currentCustomer.uuid },
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
        dispatch(showSuccess('User has been added to organization.'));
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to add user.')));
      }
    } else if (formData.role.content_type === 'call_organizer') {
      try {
        await callManagingOrganisationsAddUser({
          path: { uuid: currentCustomer.call_managing_organization_uuid },
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
        dispatch(showSuccess('User has been added to organization.'));
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to add user.')));
      }
    } else if (formData.role.content_type === 'service_provider') {
      try {
        await marketplaceServiceProvidersAddUser({
          path: { uuid: currentCustomer.service_provider_uuid },
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
        dispatch(showSuccess('User has been added to organization.'));
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to add user.')));
      }
    }
  };

  const showAllUsers = useSelector(showAllUsersSelector);
  const role = useSelector<RootState, Role>(roleSelector);

  return (
    <form onSubmit={handleSubmit(saveUser)}>
      <ModalDialog
        title={title || translate('Add user')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton submitting={submitting} invalid={invalid}>
              {translate('Add role')}
            </SubmitButton>
          </>
        }
        iconNode={<UserPlusIcon weight="bold" />}
        iconColor="success"
      >
        <FormContainer submitting={submitting}>
          <AsyncSelectField
            name="user"
            key={showAllUsers ? 'showAllUsers' : 'notShowAllUsers'}
            label={translate('User')}
            placeholder={translate('Select user...')}
            loadOptions={loadUsers}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={getOptionLabel}
            components={{ Option: UserListOptionInline }}
            required={true}
            validate={[required]}
          />

          {currentUser.is_staff && (
            <AwesomeCheckboxField
              hideLabel
              name={FIELD_ID}
              className="mt-3"
              label={translate('Show users outside organization')}
            />
          )}
          <RoleGroup
            types={
              level === 'customer' &&
              hasPermission(currentUser, {
                permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
                customerId: currentCustomer.uuid,
              })
                ? ['customer', 'project']
                : [level]
            }
          />

          {level === 'customer' && role?.content_type === 'project' && (
            <OrganizationProjectSelectField />
          )}
          <ExpirationTimeGroup />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
