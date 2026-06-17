import { CheckCircleIcon } from '@phosphor-icons/react';
import createDecorator from 'final-form-calculate';
import { useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import {
  adminArrowCustomerMappingsCreate,
  ArrowCustomerDiscovery,
  CustomerMappingSuggestion,
  WaldurCustomerBrief,
} from 'waldur-js-client';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
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

interface FormValues {
  arrow_customer: ArrowCustomerDiscovery;
  waldur_customer: WaldurCustomerBrief;
}

export const CustomerMappingCreateDialog = ({
  resolve,
}: CustomerMappingCreateDialogProps) => {
  const { closeDialog } = useModal();

  const [error, setError] = useState<string | null>(null);
  const { data: settings, isLoading: isLoadingSettings } = useArrowSettings();
  const {
    data: availableData,
    isLoading: isLoadingAvailable,
    error: availableError,
  } = useAvailableArrowCustomers();

  // Build a map from Arrow reference to suggested Waldur customer
  const suggestionMap = useMemo(() => {
    const map = new Map<string, CustomerMappingSuggestion>();
    if (availableData?.suggestions) {
      for (const suggestion of availableData.suggestions) {
        map.set(suggestion.arrow_customer.reference, suggestion);
      }
    }
    return map;
  }, [availableData?.suggestions]);

  const arrowCustomers = availableData?.arrow_customers || [];

  const decorator = useMemo(
    () =>
      createDecorator({
        field: 'arrow_customer',
        updates: {
          waldur_customer: (arrow_customer: ArrowCustomerDiscovery) => {
            if (arrow_customer) {
              const suggestion = suggestionMap.get(arrow_customer.reference);
              if (
                suggestion?.suggested_waldur_customer &&
                suggestion.confidence > 0.6
              ) {
                return suggestion.suggested_waldur_customer;
              }
            }
            return null;
          },
        },
      }) as any,
    [suggestionMap],
  );

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

    invalidateQueries: [{ queryKey: arrowQueryKeys.customerMappings() }],
  });

  if (isLoadingSettings || isLoadingAvailable) {
    return (
      <ModalDialog title={translate('Create Customer Mapping')}>
        <div className="d-flex align-items-center justify-content-center py-10">
          <LoadingSpinnerSimple className="me-2" />
          {translate('Loading Arrow customers...')}
        </div>
      </ModalDialog>
    );
  }

  if (!settings) {
    return (
      <ModalDialog title={translate('Create Customer Mapping')}>
        <Alert variant="warning">
          {translate('Arrow settings not configured')}
        </Alert>
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
        decorators={[decorator]}
        render={({ handleSubmit, invalid, form }) => (
          <form onSubmit={handleSubmit}>
            <SelectGroup
              name="arrow_customer"
              label={translate('Arrow Customer')}
              description={translate(
                'Select an Arrow customer from your configured account',
              )}
              required
              validate={required}
              placeholder={translate('Select Arrow customer...')}
              options={arrowCustomers}
              getOptionLabel={(option) => {
                const suggestion = suggestionMap.get(option.reference);
                const confidenceLabel =
                  suggestion?.suggested_waldur_customer &&
                  suggestion.confidence > 0.6
                    ? ` (${Math.round(suggestion.confidence * 100)}% match)`
                    : '';
                return `${option.companyName} (${option.reference})${confidenceLabel}`;
              }}
              getOptionValue={(option) => option.reference}
              isClearable
            />

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

            <SelectGroup
              name="waldur_customer"
              label={translate('Waldur Organization')}
              description={translate(
                'The Waldur organization to map this Arrow customer to',
              )}
              required
              validate={required}
              placeholder={translate('Select organization...')}
              options={availableData?.waldur_customers || []}
              getOptionLabel={(option: WaldurCustomerBrief) => option.name}
              getOptionValue={(option: WaldurCustomerBrief) => option.uuid}
              noOptionsMessage={() => translate('No organizations')}
              isClearable
            />

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
