import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { required } from '@waldur/core/validators';
import { usersAutocomplete } from '@waldur/customer/team/api';
import { OrganizationProjectSelectField } from '@waldur/customer/team/OrganizationProjectSelectField';
import { FormContainer } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { addCustomerUser, addProjectUser } from '@waldur/permissions/api';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { Role } from '@waldur/permissions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { customerUsersAutocomplete } from './api';
import { ExpirationTimeGroup } from './ExpirationTimeGroup';
import { RoleGroup } from './RoleGroup';
import { UserListOptionInline } from './UserListOptionInline';

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
  level?: 'project' | 'organization';
  title?: string;
}

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

  const currentUser = useSelector(getUser);
  const currentProject = useSelector(getProject);
  const currentCustomer = useSelector(getCustomer);

  const getOptionLabel = (option) =>
    option.email
      ? (option.full_name || option.username) + ` (${option.email})`
      : option.full_name || option.username;

  const saveUser = async (formData: AddUserDialogFormData) => {
    if (formData.role.content_type === 'project') {
      try {
        await addProjectUser({
          user: formData.user.uuid,
          project: formData.project
            ? formData.project.uuid
            : currentProject.uuid,
          expiration_time: formData.expiration_time,
          role: formData.role.name,
        });
        await refetch();
        dispatch(showSuccess('User has been added to project.'));
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to add user.')));
      }
    } else if (formData.role.content_type === 'customer') {
      try {
        await addCustomerUser({
          customer: currentCustomer.uuid,
          user: formData.user.uuid,
          role: formData.role.name,
          expiration_time: formData.expiration_time,
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
      <Modal.Header>
        <Modal.Title>{title || translate('Add user')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormContainer submitting={submitting}>
          <AsyncSelectField
            name="user"
            key={showAllUsers ? 'showAllUsers' : 'notShowAllUsers'}
            label={translate('User')}
            placeholder={translate('Select user...')}
            loadOptions={(query, prevOptions, page) =>
              showAllUsers
                ? usersAutocomplete({ query }, prevOptions, page)
                : customerUsersAutocomplete(
                    currentCustomer.uuid,
                    { full_name_and_email: query },
                    prevOptions,
                    page,
                  )
            }
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
              level === 'organization' &&
              hasPermission(currentUser, {
                permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
                customerId: currentCustomer.uuid,
              })
                ? ['customer', 'project']
                : ['project']
            }
          />
          {level === 'organization' && role?.content_type === 'project' && (
            <OrganizationProjectSelectField />
          )}
          <ExpirationTimeGroup />
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton block={false} submitting={submitting} invalid={invalid}>
          {translate('Add role')}
        </SubmitButton>
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
