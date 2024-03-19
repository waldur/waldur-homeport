import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { required } from '@waldur/core/validators';
import { usersAutocomplete } from '@waldur/customer/team/api';
import { FormContainer } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { Role } from '@waldur/permissions/types';
import { ExpirationTimeGroup } from '@waldur/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@waldur/project/team/RoleGroup';
import { UserListOptionInline } from '@waldur/project/team/UserListOptionInline';
import { Call } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { addCallUser } from './api';

const FORM_ID = 'AddUserDialog';

interface AddUserDialogFormData {
  role: Role;
  expiration_time: string;
  user: any;
}

interface AddUserDialogProps {
  refetch;
  call: Call;
}

export const AddUserDialog = reduxForm<
  AddUserDialogFormData,
  AddUserDialogProps
>({
  form: FORM_ID,
})(({ submitting, handleSubmit, refetch, invalid, call }) => {
  const dispatch = useDispatch();

  const getOptionLabel = (option) =>
    option.email
      ? (option.full_name || option.username) + ` (${option.email})`
      : option.full_name || option.username;

  const saveUser = async (formData: AddUserDialogFormData) => {
    try {
      await addCallUser({
        user: formData.user.uuid,
        call: call.uuid,
        expiration_time: formData.expiration_time,
        role: formData.role.name,
      });
      await refetch();
      dispatch(showSuccess('User has been added to call.'));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to add user.')));
    }
  };

  return (
    <form onSubmit={handleSubmit(saveUser)}>
      <Modal.Header>
        <Modal.Title>{translate('Add user')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormContainer submitting={submitting}>
          <AsyncSelectField
            name="user"
            label={translate('User')}
            placeholder={translate('Select user...')}
            loadOptions={(query, prevOptions, page) =>
              usersAutocomplete({ query }, prevOptions, page)
            }
            getOptionValue={(option) => option.uuid}
            getOptionLabel={getOptionLabel}
            components={{ Option: UserListOptionInline }}
            required={true}
            validate={[required]}
          />
          <RoleGroup types={['call']} />
          <ExpirationTimeGroup />
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton block={false} submitting={submitting} invalid={invalid}>
          {translate('Save')}
        </SubmitButton>
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
