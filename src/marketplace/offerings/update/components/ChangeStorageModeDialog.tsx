import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  PublicOfferingDetails,
  StorageModeEnum,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { Option } from '@/marketplace/common/registry';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface ChangeStorageModeDialogProps {
  resolve: {
    offering: Pick<PublicOfferingDetails, 'plugin_options' | 'uuid'>;
    refetch(): void;
    currentMode: StorageModeEnum;
    modes: Option[];
  };
}

export const ChangeStorageModeDialog: FC<ChangeStorageModeDialogProps> = (
  props,
) => {
  const changeStorageModeMutation = useManagedMutation<
    any,
    any,
    { storage_mode: StorageModeEnum }
  >({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateIntegration({
        path: { uuid: props.resolve.offering.uuid },
        body: {
          plugin_options: {
            ...props.resolve.offering.plugin_options,
            storage_mode: formData.storage_mode,
          },
        },
      }),
    successMessage: translate('Storage mode has been updated.'),
    errorMessage: translate('Unable to update storage mode.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form<{ storage_mode: StorageModeEnum }>
      onSubmit={(values) => changeStorageModeMutation.mutateAsync(values)}
      initialValues={{ storage_mode: props.resolve.currentMode }}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Change storage mode')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <Field name="storage_mode">
              {({ input }) => (
                <select {...input} className="form-control">
                  {props.resolve.modes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
