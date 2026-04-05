import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsSwitchBillingMode,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

const BILLING_MODES = [
  {
    value: 'monthly',
    label: translate('Monthly (Limit-based)'),
    description: translate(
      'Customers are billed monthly based on reserved limits.',
    ),
  },
  {
    value: 'prepaid',
    label: translate('Prepaid (One-time)'),
    description: translate(
      'Customers pay upfront for the full subscription period. Requires end date.',
    ),
  },
];

interface SwitchBillingModeDialogProps {
  resolve: {
    offering: Pick<PublicOfferingDetails, 'uuid'>;
    refetch(): void;
    currentMode: string;
  };
}

export const SwitchBillingModeDialog: FC<SwitchBillingModeDialogProps> = (
  props,
) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  return (
    <Form<{ billing_mode: string }>
      onSubmit={async (formData) => {
        try {
          await marketplaceProviderOfferingsSwitchBillingMode({
            path: { uuid: props.resolve.offering.uuid },
            body: formData as any,
          });
          showSuccess(translate('Billing mode has been updated.'));
          closeDialog();
          props.resolve.refetch();
        } catch (error) {
          showErrorResponse(error, translate('Unable to update billing mode.'));
        }
      }}
      initialValues={{ billing_mode: props.resolve.currentMode }}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Switch billing mode')}
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
            <p className="text-muted mb-4">
              {translate(
                'Switch all infrastructure components between monthly and prepaid billing.',
              )}
            </p>
            <Field name="billing_mode">
              {({ input }) => (
                <div className="d-flex flex-column gap-3">
                  {BILLING_MODES.map((mode) => (
                    <label
                      key={mode.value}
                      className={`d-flex align-items-start gap-3 p-3 border rounded cursor-pointer ${
                        input.value === mode.value
                          ? 'border-primary bg-light-primary'
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        {...input}
                        value={mode.value}
                        checked={input.value === mode.value}
                        className="mt-1"
                      />
                      <div>
                        <div className="fw-bold">{mode.label}</div>
                        <div className="text-muted fs-7">
                          {mode.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
