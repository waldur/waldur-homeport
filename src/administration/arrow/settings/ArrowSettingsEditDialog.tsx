import { useCallback, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import type { ArrowSettings, InvoicePriceSourceEnum } from 'waldur-js-client';

import { required } from '@/core/validators';
import { SecretField, SelectField, StringField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showSuccess } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';

import { useUpdateArrowSettings } from '../api';

interface ArrowSettingsEditDialogProps {
  resolve: {
    settings: ArrowSettings;
    refetch: () => void;
  };
}

const INVOICE_PRICE_SOURCE_OPTIONS = [
  { value: 'sell', label: 'Sell price' },
  { value: 'buy', label: 'Buy price' },
];

interface FormValues {
  api_url: string;
  api_key?: string;
  export_type_reference?: string;
  classification_filter?: string;
  sync_enabled: boolean;
  invoice_price_source?: { value: string; label: string };
}

export const ArrowSettingsEditDialog = ({
  resolve,
}: ArrowSettingsEditDialogProps) => {
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const updateSettings = useUpdateArrowSettings();
  const { settings, refetch } = resolve;

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      setError(null);
      try {
        await updateSettings.mutateAsync({
          uuid: settings.uuid,
          data: {
            api_url: values.api_url,
            // Only include api_key if provided (non-empty)
            ...(values.api_key ? { api_key: values.api_key } : {}),
            export_type_reference: values.export_type_reference || undefined,
            classification_filter: values.classification_filter || undefined,
            sync_enabled: values.sync_enabled,
            invoice_price_source: (values.invoice_price_source?.value ||
              'sell') as InvoicePriceSourceEnum,
          },
        });
        dispatch(showSuccess(translate('Arrow settings updated')));
        refetch();
        dispatch(closeModalDialog());
      } catch (e: any) {
        setError(
          e.response?.data?.detail ||
            e.message ||
            translate('Failed to update settings'),
        );
      }
    },
    [updateSettings, settings.uuid, dispatch, refetch],
  );

  const handleClose = useCallback(() => {
    dispatch(closeModalDialog());
  }, [dispatch]);

  return (
    <ModalDialog title={translate('Edit Arrow Settings')}>
      <Form
        onSubmit={handleSubmit}
        initialValues={{
          api_url: settings.api_url,
          api_key: settings.api_key || '',
          export_type_reference: settings.export_type_reference || '',
          classification_filter: settings.classification_filter || '',
          sync_enabled: settings.sync_enabled,
          invoice_price_source: INVOICE_PRICE_SOURCE_OPTIONS.find(
            (o) => o.value === (settings.invoice_price_source || 'sell'),
          ),
        }}
        render={({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit}>
            <FormGroup
              label={translate('API URL')}
              description={translate('The Arrow API endpoint URL')}
              required
            >
              <Field
                name="api_url"
                component={StringField as any}
                validate={required}
              />
            </FormGroup>

            <FormGroup
              label={translate('API Key')}
              description={translate('Arrow API key for authentication')}
            >
              <Field name="api_key" component={SecretField as any} />
            </FormGroup>

            <FormGroup
              label={translate('Export Type Reference')}
              description={translate(
                'Billing export template reference (optional)',
              )}
            >
              <Field
                name="export_type_reference"
                component={StringField as any}
              />
            </FormGroup>

            <FormGroup
              label={translate('Classification Filter')}
              description={translate(
                'Filter for IaaS/SaaS classification (optional)',
              )}
            >
              <Field
                name="classification_filter"
                component={StringField as any}
              />
            </FormGroup>

            <FormGroup
              label={translate('Invoice price source')}
              description={translate(
                'Which price to use for invoice items: sell or buy',
              )}
            >
              <Field
                name="invoice_price_source"
                component={SelectField as any}
                options={INVOICE_PRICE_SOURCE_OPTIONS}
                isClearable={false}
              />
            </FormGroup>

            <FormGroup>
              <Field
                name="sync_enabled"
                component={AwesomeCheckboxField as any}
                label={translate('Sync enabled')}
              />
            </FormGroup>

            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="d-flex justify-content-end gap-2">
              <ActionButton
                action={handleClose}
                variant="secondary"
                title={translate('Cancel')}
              />
              <SubmitButton
                submitting={updateSettings.isPending}
                disabled={invalid}
                label={translate('Save')}
              />
            </div>
          </form>
        )}
      />
    </ModalDialog>
  );
};
