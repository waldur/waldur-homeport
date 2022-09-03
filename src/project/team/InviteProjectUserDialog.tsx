import { DateTime } from 'luxon';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { usersAutocomplete } from '@waldur/customer/team/api';
import { getRoles } from '@waldur/customer/team/utils';
import { FormContainer, SelectField } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { InvitationService } from '@waldur/invitations/InvitationService';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { UserListOptionInline } from '@waldur/project/team/UserGroup';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getProject } from '@waldur/workspace/selectors';

const FORM_ID = 'AddProjectUserDialog';

interface AddProjectUserDialogFormData {
  role: string;
  expiration_time: string;
  user: any;
}

export const InviteProjectUserDialog = reduxForm<
  AddProjectUserDialogFormData,
  { refreshList }
>({
  form: FORM_ID,
})(({ submitting, handleSubmit, refreshList }) => {
  const dispatch = useDispatch();
  const currentProject = useSelector(getProject);

  const getOptionLabel = (option) =>
    option.email
      ? (option.full_name || option.username) + ` (${option.email})`
      : option.full_name || option.username;

  const inviteUser = async (formData) => {
    try {
      const payload = {
        user: formData.user.url,
        email: formData.user.email,
        project: currentProject.url,
        expiration_time: formData.expiration_time,
        project_role: formData.role.value,
      };
      await InvitationService.createInvitation(payload);
      refreshList();
      dispatch(closeModalDialog());
      dispatch(showSuccess('Invitation has been created.'));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to invite user.')));
    }
  };

  return (
    <form onSubmit={handleSubmit(inviteUser)}>
      <Modal.Header>
        <Modal.Title>{translate('Invite user to this project')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormContainer submitting={submitting}>
          <AsyncSelectField
            name="user"
            label={translate('User')}
            placeholder={translate('Select user...')}
            loadOptions={(query, prevOptions, page) =>
              usersAutocomplete({ full_name: query }, prevOptions, page)
            }
            getOptionValue={(option) => option.full_name || option.username}
            getOptionLabel={getOptionLabel}
            components={{ Option: UserListOptionInline }}
            required={true}
          />
          <SelectField
            name="role"
            label={translate('Role')}
            options={getRoles()}
            required={true}
          />
          <DateField
            name="expiration_time"
            label={translate('Role expires on')}
            minDate={DateTime.now().plus({ days: 1 }).toISO()}
          />
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton block={false} submitting={submitting}>
          {translate('Invite user')}
        </SubmitButton>
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
