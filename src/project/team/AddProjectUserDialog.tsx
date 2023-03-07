import { DateTime } from 'luxon';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { ProjectPermissionsService } from '@waldur/customer/services/ProjectPermissionsService';
import { usersAutocomplete } from '@waldur/customer/team/api';
import { OrganizationProjectSelectField } from '@waldur/customer/team/OrganizationProjectSelectField';
import { getRoles } from '@waldur/customer/team/utils';
import { FormContainer, SelectField } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { UserListOptionInline } from '@waldur/project/team/UserGroup';
import { showErrorResponse } from '@waldur/store/notify';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

const FORM_ID = 'AddProjectUserDialog';

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

export const AddProjectUserDialog = reduxForm<
  AddProjectUserDialogFormData,
  AddProjectUserDialogProps
>({
  form: FORM_ID,
})(({ submitting, handleSubmit, refetch, level, title }) => {
  const dispatch = useDispatch();
  const currentProject = useSelector(getProject);

  const getOptionLabel = (option) =>
    option.email
      ? (option.full_name || option.username) + ` (${option.email})`
      : option.full_name || option.username;

  const saveUser = async (formData) => {
    if (level === 'organization' && !formData.project) return;
    try {
      await ProjectPermissionsService.create({
        user: formData.user.url,
        project: formData.project ? formData.project.url : currentProject.url,
        expiration_time: formData.expiration_time,
        role: formData.role.value,
      });
      refetch();
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to add user.')));
    }
  };

  return (
    <form onSubmit={handleSubmit(saveUser)}>
      <Modal.Header>
        <Modal.Title>{title || translate('Add user')}</Modal.Title>
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
          {level === 'organization' && <OrganizationProjectSelectField />}
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
          {translate('Add')}
        </SubmitButton>
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
