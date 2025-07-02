import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  PublicOfferingDetails,
  StorageModeEnum,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { Option } from '@waldur/marketplace/common/registry';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

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
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  return (
    <Form<{ storage_mode: StorageModeEnum }>
      onSubmit={async (formData) => {
        try {
          await marketplaceProviderOfferingsUpdateIntegration({
            path: { uuid: props.resolve.offering.uuid },
            body: {
              plugin_options: {
                ...props.resolve.offering.plugin_options,
                storage_mode: formData.storage_mode,
              },
            },
          });
          showSuccess(translate('Storage mode has been updated.'));
          closeDialog();
          props.resolve.refetch();
        } catch (error) {
          showErrorResponse(error, translate('Unable to update storage mode.'));
        }
      }}
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
