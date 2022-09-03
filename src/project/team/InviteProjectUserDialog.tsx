import { DateTime } from 'luxon';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { usersAutocomplete } from '@waldur/customer/team/api';
import { getRoles } from '@waldur/customer/team/utils';
import { FormContainer, SelectField } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { DateField } from '@waldur/form/DateField';
import {
  reactSelectMenuPortaling,
  datePickerOverlayContainerInDialogs,
} from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { InvitationService } from '@waldur/invitations/InvitationService';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { UserListOptionInline } from '@waldur/project/team/UserGroup';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getProject } from '@waldur/workspace/selectors';

const FORM_ID = 'AddProjectUserDialog';

interface InviteProjectUserDialogFormData {
  project_role: string;
  expiration_time: string;
  user: any;
  email: string;
}

export const InviteProjectUserDialog = reduxForm<
  InviteProjectUserDialogFormData,
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

  const saveUser = async (formData) => {
    try {
      const payload = {
        email: formData.user.email,
        project: currentProject.url,
        expiration_time: formData.expiration_time,
        project_role: formData.project_role.value,
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
    <form onSubmit={handleSubmit(saveUser)}>
      <ModalHeader>
        <ModalTitle>{translate('Invite user to project')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <FormContainer submitting={submitting}>
          <AsyncSelectField
            name="user"
            label={translate('User')}
            placeholder={translate('Select user...')}
            loadOptions={(query, prevOptions, page) =>
              usersAutocomplete({ full_name: query }, prevOptions, page)
            }
            {...reactSelectMenuPortaling()}
            getOptionValue={(option) => option.full_name || option.username}
            getOptionLabel={getOptionLabel}
            components={{ Option: UserListOptionInline }}
            required={true}
          />
          <SelectField
            name="project_role"
            label={translate('Role')}
            options={getRoles()}
            {...reactSelectMenuPortaling()}
            required={true}
          />
          <DateField
            name="expiration_time"
            label={translate('Role expires on')}
            minDate={DateTime.now().plus({ days: 1 }).toISO()}
            weekStartsOn={1}
            {...datePickerOverlayContainerInDialogs()}
          />
        </FormContainer>
      </ModalBody>
      <ModalFooter>
        <SubmitButton block={false} submitting={submitting}>
          {translate('Invite')}
        </SubmitButton>
        <CloseDialogButton />
      </ModalFooter>
    </form>
  );
});
