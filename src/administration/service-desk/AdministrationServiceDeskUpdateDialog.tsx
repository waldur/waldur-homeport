import { capitalize, pick } from 'lodash-es';
import { useMemo } from 'react';
import { Form } from 'react-final-form';
import { overrideSettings } from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  AUTH_METHOD_FIELD,
  prepareAtlassianSettings,
  prepareAtlassianSubmission,
} from './atlassianAuth';
import {
  getProviderSettings,
  SupportSettingsForm,
} from './SupportSettingsForm';

interface AdministrationServiceDeskUpdateDialogProps {
  resolve: {
    name: string;
    initialValues: Record<string, unknown>;
  };
}

export const AdministrationServiceDeskUpdateDialog = ({
  resolve,
}: AdministrationServiceDeskUpdateDialogProps) => {
  const isAtlassian = resolve.name === 'atlassian';

  const initialValues = useMemo(
    () =>
      isAtlassian
        ? prepareAtlassianSettings(resolve.initialValues)
        : resolve.initialValues,
    [isAtlassian, resolve.initialValues],
  );

  const updateServiceDeskMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      // The provider's own settings only; not every one carries its prefix.
      const settingKeys = getProviderSettings(resolve.name).map(
        (field) => field.key,
      );
      let body: Record<string, unknown> = pick(formData, settingKeys);
      if (isAtlassian) {
        body = prepareAtlassianSubmission(
          body,
          formData[AUTH_METHOD_FIELD],
          resolve.initialValues,
        );
      }
      return overrideSettings({ body, ...formDataOptions });
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
      initialValues={initialValues}
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
