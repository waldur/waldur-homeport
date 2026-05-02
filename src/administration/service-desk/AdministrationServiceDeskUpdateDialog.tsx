import { capitalize } from 'lodash-es';
import { Form } from 'react-final-form';
import { overrideSettings } from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
  const updateServiceDeskMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const relevantFormData = {};
      Object.keys(formData).forEach((fieldName) => {
        if (fieldName.startsWith(resolve.name.toUpperCase())) {
          relevantFormData[fieldName] = formData[fieldName];
        }
      });
      return overrideSettings({ body: relevantFormData, ...formDataOptions });
    },

    successMessage: translate('Configurations have been updated'),
    errorMessage: translate('Unable to update the configurations.'),

    invalidateQueries: [
      {
        queryKey: ['AdministrationServiceDesk'],
      },
    ],
  });

  return (
    <Form
      onSubmit={(values) => updateServiceDeskMutation.mutateAsync(values)}
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
