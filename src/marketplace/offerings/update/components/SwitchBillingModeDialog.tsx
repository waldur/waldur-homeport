import { ArrowRightIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Field, Form, useFormState } from 'react-final-form';
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
  {
    value: 'usage',
    label: translate('Usage-based'),
    description: translate(
      'Customers are billed based on actual resource usage reported by the service provider.',
    ),
  },
];

const BILLING_TYPE_LABELS: Record<string, string> = {
  limit: translate('Monthly'),
  one: translate('Prepaid'),
  usage: translate('Usage'),
  fixed: translate('Fixed'),
  few: translate('On plan switch'),
};

const MODE_TO_BILLING_TYPE: Record<string, string> = {
  monthly: 'limit',
  prepaid: 'one',
  usage: 'usage',
};

const ImpactPreview: FC<{ components: any[]; currentMode: string }> = ({
  components,
  currentMode,
}) => {
  const { values } = useFormState();
  const targetMode = values.billing_mode;

  const affected = useMemo(() => {
    if (!components || targetMode === currentMode) return [];
    const targetBillingType = MODE_TO_BILLING_TYPE[targetMode];
    return components.filter((c: any) => c.billing_type !== targetBillingType);
  }, [components, targetMode, currentMode]);

  if (!affected.length || targetMode === currentMode) return null;

  const targetLabel =
    BILLING_MODES.find((m) => m.value === targetMode)?.label || targetMode;

  return (
    <div className="mt-4 p-3 bg-light rounded">
      <div className="fw-bold mb-2">
        {translate('Impact: {count} components will be changed', {
          count: affected.length,
        })}
      </div>
      <div className="d-flex flex-column gap-1">
        {affected.map((c: any) => (
          <div key={c.uuid} className="d-flex align-items-center gap-2 fs-7">
            <span className="fw-semibold">{c.name}</span>
            <span className="text-muted">
              {BILLING_TYPE_LABELS[c.billing_type] || c.billing_type}
            </span>
            <ArrowRightIcon size={14} weight="bold" className="text-muted" />
            <span className="text-primary">{targetLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SwitchBillingModeDialogProps {
  resolve: {
    offering: Pick<PublicOfferingDetails, 'uuid' | 'type' | 'components'>;
    refetch(): void;
    currentMode: string;
  };
}

export const SwitchBillingModeDialog: FC<SwitchBillingModeDialogProps> = (
  props,
) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const availableModes = BILLING_MODES.filter(
    (mode) =>
      mode.value !== 'usage' ||
      props.resolve.offering.type !== 'OpenStack.Tenant',
  );

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
                'Switch all infrastructure components between monthly, prepaid, and usage-based billing.',
              )}
            </p>
            <Field name="billing_mode">
              {({ input }) => (
                <div className="d-flex flex-column gap-3">
                  {availableModes.map((mode) => (
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
            <ImpactPreview
              components={props.resolve.offering.components}
              currentMode={props.resolve.currentMode}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
