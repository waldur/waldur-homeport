import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { usersAutocomplete } from '@waldur/customer/team/api';
import { OrganizationProjectSelectField } from '@waldur/customer/team/OrganizationProjectSelectField';
import { FormContainer } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { addProjectUser } from '@waldur/permissions/api';
import { UserListOptionInline } from '@waldur/project/team/UserGroup';
import { showErrorResponse } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';
import { getProject, getCustomer, getUser } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { customerUsersAutocomplete } from './api';
import { ExpirationTimeGroup } from './ExpirationTimeGroup';
import { RoleGroup } from './RoleGroup';

const FORM_ID = 'AddProjectUserDialog';
const FIELD_ID = 'showAllUsers';

interface AddProjectUserDialogFormData {
  role: string;
  expiration_time: string;
  user: any;
  project?: Project;
}

interface AddProjectUserDialogProps {
  refetch;
  level?: 'project' | 'organization';
  title?: string;
}

const showAllUsersSelector = (state: RootState) =>
  formValueSelector(FORM_ID)(state, FIELD_ID);

export const AddProjectUserDialog = reduxForm<
  AddProjectUserDialogFormData,
  AddProjectUserDialogProps
>({
  form: FORM_ID,
})(({ submitting, handleSubmit, refetch, level, title }) => {
  const dispatch = useDispatch();

  const currentUser = useSelector(getUser);
  const currentProject = useSelector(getProject);
  const currentCustomer = useSelector(getCustomer);

  const getOptionLabel = (option) =>
    option.email
      ? (option.full_name || option.username) + ` (${option.email})`
      : option.full_name || option.username;

  const saveUser = async (formData) => {
    if (level === 'organization' && !formData.project) return;
    try {
      await addProjectUser({
        user: formData.user.uuid,
        project: formData.project ? formData.project.uuid : currentProject.uuid,
        expiration_time: formData.expiration_time,
        role: formData.role.name,
      });
      refetch();
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to add user.')));
    }
  };

  const showAllUsers = useSelector(showAllUsersSelector);

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
                ? usersAutocomplete({ full_name: query }, prevOptions, page)
                : customerUsersAutocomplete(
                    currentCustomer.uuid,
                    { full_name: query },
                    prevOptions,
                    page,
                  )
            }
            getOptionValue={(option) => option.uuid}
            getOptionLabel={getOptionLabel}
            components={{ Option: UserListOptionInline }}
            required={true}
          />
          {currentUser.is_staff && (
            <AwesomeCheckboxField
              hideLabel
              name={FIELD_ID}
              className="mt-3"
              label={translate('Show users outside organization')}
            />
          )}
          {level === 'organization' && <OrganizationProjectSelectField />}
          <RoleGroup />
          <ExpirationTimeGroup />
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton block={false} submitting={submitting}>
          {translate('Add')}
        </SubmitButton>
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
