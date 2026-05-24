import { CheckCircleIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Alert, Form as BSForm } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { adminArrowCustomerMappingsCreate } from 'waldur-js-client';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { SelectField as Select } from '@/form/select';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

import {
  arrowQueryKeys,
  useArrowSettings,
  useAvailableArrowCustomers,
} from '../api';

interface CustomerMappingCreateDialogProps {
  resolve: {
    refetch: () => void;
  };
}

interface ArrowCustomer {
  reference: string;
  companyName: string;
  email?: string;
  city?: string;
  countryCode?: string;
}

interface WaldurCustomer {
  uuid: string;
  name: string;
  abbreviation?: string;
}

interface Suggestion {
  arrow_customer: ArrowCustomer;
  suggested_waldur_customer?: WaldurCustomer | null;
  confidence?: number;
  existing_mapping?: boolean;
}

interface FormValues {
  arrow_customer: ArrowCustomer;
  waldur_customer: WaldurCustomer;
}

export const CustomerMappingCreateDialog = ({
  resolve,
}: CustomerMappingCreateDialogProps) => {
  const { closeDialog } = useModal();

  const [error, setError] = useState<string | null>(null);
  const { data: settings } = useArrowSettings();
  const {
    data: availableData,
    isLoading: isLoadingAvailable,
    error: availableError,
  } = useAvailableArrowCustomers();

  // Build a map from Arrow reference to suggested Waldur customer
  const suggestionMap = useMemo(() => {
    const map = new Map<string, Suggestion>();
    if (availableData?.suggestions) {
      for (const suggestion of availableData.suggestions) {
        map.set(suggestion.arrow_customer.reference, suggestion);
      }
    }
    return map;
  }, [availableData?.suggestions]);

  // Convert Waldur customers to options format
  const waldurCustomerOptions = useMemo(() => {
    return (availableData?.waldur_customers || []).map((c) => ({
      uuid: c.uuid,
      name: c.name,
      abbreviation: c.abbreviation,
    }));
  }, [availableData?.waldur_customers]);

  const createMappingMutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      adminArrowCustomerMappingsCreate({
        body: {
          settings: settings!.uuid,
          arrow_reference: values.arrow_customer.reference,
          arrow_company_name: values.arrow_customer.companyName,
          waldur_customer: values.waldur_customer.uuid,
        },
      }),

    successMessage: translate('Customer mapping created'),
    errorMessage: translate('Failed to create mapping'),
    refetch: resolve.refetch,

    onError: (e: any) => {
      setError(
        e.response?.data?.detail ||
          e.message ||
          translate('Failed to create mapping'),
      );
    },

    invalidateQueries: [
      {
        queryKey: arrowQueryKeys.customerMappings(),
      },
    ],
  });

  if (!settings) {
    return (
      <ModalDialog title={translate('Create Customer Mapping')}>
        <Alert variant="warning">
          {translate('Arrow settings not configured')}
        </Alert>
      </ModalDialog>
    );
  }

  if (isLoadingAvailable) {
    return (
      <ModalDialog title={translate('Create Customer Mapping')}>
        <div className="d-flex align-items-center justify-content-center py-10">
          <LoadingSpinnerSimple className="me-2" />
          {translate('Loading Arrow customers...')}
        </div>
      </ModalDialog>
    );
  }

  if (availableError) {
    return (
      <ModalDialog title={translate('Create Customer Mapping')}>
        <Alert variant="danger">
          {translate('Failed to load Arrow customers. Please try again.')}
        </Alert>
        <div className="d-flex justify-content-end">
          <ActionButton
            action={closeDialog}
            variant="secondary"
            title={translate('Close')}
          />
        </div>
      </ModalDialog>
    );
  }

  const arrowCustomers = availableData?.arrow_customers || [];

  if (arrowCustomers.length === 0) {
    return (
      <ModalDialog title={translate('Create Customer Mapping')}>
        <Alert variant="info">
          {translate(
            'All Arrow customers have already been mapped to Waldur organizations.',
          )}
        </Alert>
        <div className="d-flex justify-content-end">
          <ActionButton
            action={closeDialog}
            variant="secondary"
            title={translate('Close')}
          />
        </div>
      </ModalDialog>
    );
  }

  return (
    <ModalDialog title={translate('Create Customer Mapping')}>
      <Form<FormValues>
        onSubmit={(values) => createMappingMutation.mutateAsync(values)}
        render={({ handleSubmit, invalid, form }) => (
          <form onSubmit={handleSubmit}>
            <FormGroup
              label={translate('Arrow Customer')}
              description={translate(
                'Select an Arrow customer from your configured account',
              )}
              required
            >
              <Field
                name="arrow_customer"
                validate={required}
                render={({ input, meta }) => (
                  <>
                    <BSForm.Select
                      {...input}
                      value={input.value?.reference || ''}
                      onChange={(e) => {
                        const selectedRef = e.target.value;
                        const selectedCustomer = arrowCustomers.find(
                          (c) => c.reference === selectedRef,
                        );
                        input.onChange(selectedCustomer || null);

                        // Auto-fill Waldur organization from suggestion if confidence > 0.6
                        if (selectedCustomer) {
                          const suggestion = suggestionMap.get(selectedRef);
                          if (
                            suggestion?.suggested_waldur_customer &&
                            suggestion.confidence > 0.6
                          ) {
                            form.change(
                              'waldur_customer',
                              suggestion.suggested_waldur_customer,
                            );
                          } else {
                            // Clear previous suggestion if no good match
                            form.change('waldur_customer', null);
                          }
                        }
                      }}
                      isInvalid={meta.touched && meta.error}
                    >
                      <option value="">
                        {translate('Select Arrow customer...')}
                      </option>
                      {arrowCustomers.map((customer) => {
                        const suggestion = suggestionMap.get(
                          customer.reference,
                        );
                        const confidenceLabel =
                          suggestion?.suggested_waldur_customer &&
                          suggestion.confidence > 0.6
                            ? ` (${Math.round(suggestion.confidence * 100)}% match)`
                            : '';
                        return (
                          <option
                            key={customer.reference}
                            value={customer.reference}
                          >
                            {customer.companyName} ({customer.reference})
                            {confidenceLabel}
                          </option>
                        );
                      })}
                    </BSForm.Select>
                    {meta.touched && meta.error && (
                      <BSForm.Control.Feedback type="invalid">
                        {meta.error}
                      </BSForm.Control.Feedback>
                    )}
                  </>
                )}
              />
            </FormGroup>

            <Field
              name="arrow_customer"
              subscription={{ value: true }}
              render={({ input }) =>
                input.value ? (
                  <div className="mb-4 p-3 border rounded">
                    <small className="text-muted d-block mb-1">
                      {translate('Selected Arrow Customer')}
                    </small>
                    <div>
                      <strong>{input.value.companyName}</strong>
                    </div>
                    <div className="text-muted">
                      {translate('Reference')}: {input.value.reference}
                    </div>
                    {input.value.email && (
                      <div className="text-muted">
                        {translate('Email')}: {input.value.email}
                      </div>
                    )}
                    {(input.value.city || input.value.countryCode) && (
                      <div className="text-muted">
                        {translate('Location')}: {input.value.city}
                        {input.value.city && input.value.countryCode && ', '}
                        {input.value.countryCode}
                      </div>
                    )}
                  </div>
                ) : null
              }
            />

            <FormGroup
              label={translate('Waldur Organization')}
              description={translate(
                'The Waldur organization to map this Arrow customer to',
              )}
              required
            >
              <Select
                name="waldur_customer"
                validate={required}
                placeholder={translate('Select organization...')}
                options={waldurCustomerOptions}
                getOptionLabel={(option: WaldurCustomer) => option.name}
                getOptionValue={(option: WaldurCustomer) => option.uuid}
                noOptionsMessage={() => translate('No organizations')}
                isClearable
              />
            </FormGroup>

            <Field
              name="waldur_customer"
              subscription={{ value: true }}
              render={({ input }) => {
                if (!input.value) return null;

                // Check if there's a suggestion for the selected Arrow customer
                const arrowCustomerField =
                  form.getState().values.arrow_customer;
                if (!arrowCustomerField) return null;

                const suggestion = suggestionMap.get(
                  arrowCustomerField.reference,
                );
                const isSuggested =
                  suggestion?.suggested_waldur_customer?.uuid ===
                  input.value.uuid;

                if (isSuggested && suggestion && suggestion.confidence > 0.6) {
                  return (
                    <Alert variant="success" className="mb-4">
                      <CheckCircleIcon className="me-2" weight="bold" />
                      {translate('Auto-matched with {confidence}% confidence', {
                        confidence: Math.round(suggestion.confidence * 100),
                      })}
                    </Alert>
                  );
                }
                return null;
              }}
            />

            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="d-flex justify-content-end gap-2">
              <ActionButton
                action={closeDialog}
                variant="secondary"
                title={translate('Cancel')}
              />
              <SubmitButton
                submitting={createMappingMutation.isPending}
                disabled={invalid}
                label={translate('Create')}
              />
            </div>
          </form>
        )}
      />
    </ModalDialog>
  );
};
