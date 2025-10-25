import { useQueryClient } from '@tanstack/react-query';
import { capitalize } from 'lodash-es';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { overrideSettings } from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { SupportSettingsForm } from './SupportSettingsForm';

export const AdministrationServiceDeskUpdateDialog = reduxForm<
  {},
  { name: string }
>({
  form: 'AdministrationServiceDeskUpdateDialog',
})((props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const callback = async (formData) => {
    const relevantFormData = {};
    Object.keys(formData).forEach((fieldName) => {
      if (fieldName.startsWith(props.name.toUpperCase())) {
        relevantFormData[fieldName] = formData[fieldName];
      }
    });
    try {
      await overrideSettings({ body: relevantFormData, ...formDataOptions });
      queryClient.invalidateQueries({
        queryKey: ['AdministrationServiceDesk'],
      });
      dispatch(showSuccess('Configurations have been updated'));
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to update the configurations.')),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(callback)} autoComplete="off">
      <ModalDialog
        title={translate('Update {name} settings', {
          name: capitalize(props.name),
        })}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Update')}
            />
          </>
        }
      >
        <SupportSettingsForm name={props.name} />
      </ModalDialog>
    </form>
  );
});
