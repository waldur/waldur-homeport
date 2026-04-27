import { useQueryClient } from '@tanstack/react-query';
import { capitalize } from 'lodash-es';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { overrideSettings } from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { SupportSettingsForm } from './SupportSettingsForm';

interface AdministrationServiceDeskUpdateDialogProps {
  resolve: {
    name: string;
    initialValues: Record<string, unknown>;
  };
}

export const AdministrationServiceDeskUpdateDialog = ({
  resolve,
}: AdministrationServiceDeskUpdateDialogProps) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const onSubmit = async (formData) => {
    const relevantFormData = {};
    Object.keys(formData).forEach((fieldName) => {
      if (fieldName.startsWith(resolve.name.toUpperCase())) {
        relevantFormData[fieldName] = formData[fieldName];
      }
    });
    try {
      await overrideSettings({ body: relevantFormData, ...formDataOptions });
      queryClient.invalidateQueries({
        queryKey: ['AdministrationServiceDesk'],
      });
      dispatch(showSuccess(translate('Configurations have been updated')));
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to update the configurations.')),
      );
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={resolve.initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} autoComplete="off">
          <ModalDialog
            title={translate('Update {name} settings', {
              name: capitalize(resolve.name),
            })}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Update')}
                />
              </>
            }
          >
            <SupportSettingsForm name={resolve.name} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
