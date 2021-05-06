import moment from 'moment';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { ProjectPermissionsService } from '@waldur/customer/services/ProjectPermissionsService';
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
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { UserListOption } from '@waldur/project/team/UserGroup';
import { showErrorResponse } from '@waldur/store/notify';
import { getProject } from '@waldur/workspace/selectors';

const FORM_ID = 'AddProjectUserDialog';

interface AddProjectUserDialogFormData {
  role: string;
  expiration_time: string;
  user: any;
}

export const AddProjectUserDialog = reduxForm<
  AddProjectUserDialogFormData,
  { refreshList }
>({
  form: FORM_ID,
})(({ submitting, handleSubmit, refreshList }) => {
  const dispatch = useDispatch();
  const currentProject = useSelector(getProject);

  const saveUser = async (formData) => {
    try {
      await ProjectPermissionsService.create({
        user: formData.user.url,
        project: currentProject.url,
        expiration_time: formData.expiration_time,
        role: formData.role.value,
      });
      refreshList();
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to add user.')));
    }
  };

  return (
    <form onSubmit={handleSubmit(saveUser)}>
      <ModalHeader>
        <ModalTitle>{translate('Add user')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <FormContainer submitting={submitting}>
          <AsyncSelectField
            name="user"
            label={translate('User')}
            placeholder={translate('Select user...')}
            loadOptions={(query, prevOptions, { page }) =>
              usersAutocomplete({ full_name: query }, prevOptions, page)
            }
            {...reactSelectMenuPortaling()}
            getOptionValue={(option) => option.full_name || option.username}
            getOptionLabel={(option) => option.full_name || option.username}
            components={{ Option: UserListOption }}
            required={true}
          />
          <SelectField
            name="role"
            label={translate('Role')}
            options={getRoles()}
            {...reactSelectMenuPortaling()}
            required={true}
          />
          <DateField
            name="expiration_time"
            label={translate('Role expires on')}
            minDate={moment().add(1, 'days').toISOString()}
            weekStartsOn={1}
            {...datePickerOverlayContainerInDialogs()}
          />
        </FormContainer>
      </ModalBody>
      <ModalFooter>
        <SubmitButton block={false} submitting={submitting}>
          {translate('Add')}
        </SubmitButton>
        <CloseDialogButton />
      </ModalFooter>
    </form>
  );
});
