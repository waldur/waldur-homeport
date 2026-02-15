import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Table as BTable } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import { useDiscoverArrowCustomers } from '../api';
import type { ArrowSetupFormValues } from '../types';

export const Step2CustomerDiscovery: FC<WizardStepProps> = (props) => {
  const form = useForm<ArrowSetupFormValues>();
  const { values } = useFormState<ArrowSetupFormValues>();
  const [error, setError] = useState<string | null>(null);
  const discoverCustomers = useDiscoverArrowCustomers();

  // Discover customers on mount (only if not already done)
  useEffect(() => {
    if (values.discoveryComplete) return;

    const discover = async () => {
      try {
        const response = await discoverCustomers.mutateAsync({
          api_url: values.api_url,
          api_key: values.api_key,
        });
        const data = response.data;
        form.change('customers', data.arrow_customers || []);
        form.change('waldurCustomers', data.waldur_customers || []);
        form.change('suggestions', data.suggestions || []);
        form.change('exportTypes', data.export_types || []);

        // Pre-populate mappings from high-confidence suggestions
        const initialMappings: Record<string, string> = {};
        (data.suggestions || []).forEach((suggestion) => {
          if (
            suggestion.suggested_waldur_customer &&
            suggestion.confidence &&
            suggestion.confidence > 0.7
          ) {
            initialMappings[suggestion.arrow_customer.reference] =
              suggestion.suggested_waldur_customer.uuid;
          }
        });
        form.change('selectedMappings', initialMappings);
        form.change('discoveryComplete', true);
      } catch (e: any) {
        setError(
          e.response?.data?.detail ||
            e.message ||
            translate('Failed to discover customers'),
        );
      }
    };
    discover();
  }, [values.discoveryComplete]);

  const waldurCustomerOptions = useMemo(
    () =>
      values.waldurCustomers.map((c) => ({
        value: c.uuid,
        label: c.name,
      })),
    [values.waldurCustomers],
  );

  const handleMappingChange = useCallback(
    (arrowRef: string, waldurUuid: string | null) => {
      const current = values.selectedMappings;
      if (waldurUuid) {
        form.change('selectedMappings', { ...current, [arrowRef]: waldurUuid });
      } else {
        const { [arrowRef]: _, ...rest } = current;
        form.change('selectedMappings', rest);
      }
    },
    [values.selectedMappings, form],
  );

  const getSuggestionForCustomer = useCallback(
    (arrowRef: string) => {
      return values.suggestions.find(
        (s) => s.arrow_customer.reference === arrowRef,
      );
    },
    [values.suggestions],
  );

  const mappingCount = Object.keys(values.selectedMappings).length;

  const renderFooter = () => (
    <>
      <SubmitButton
        submitting={false}
        variant="tertiary"
        className="min-w-125px me-auto"
        onClick={() => props.onPrev(values)}
        type="button"
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        iconOnLeft
      />
      <CloseDialogButton className="min-w-125px" />
      <SubmitButton
        submitting={false}
        label={translate('Continue')}
        onClick={() => props.handleSubmit()}
        type="button"
      />
    </>
  );

  if (discoverCustomers.isPending) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="mt-4 text-muted">
            {translate('Discovering Arrow customers...')}
          </p>
        </div>
      </WizardModal>
    );
  }

  if (error) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      </WizardModal>
    );
  }

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <h4 className="mb-4">{translate('Map Arrow Customers to Waldur')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'Select which Waldur organization each Arrow customer should be mapped to. High-confidence suggestions are pre-selected.',
        )}
      </p>

      {values.customers.length === 0 ? (
        <Alert variant="info">
          {translate(
            'No Arrow customers found. You can continue without mappings.',
          )}
        </Alert>
      ) : (
        <div className="table-responsive mb-4" style={{ maxHeight: '400px' }}>
          <BTable striped bordered hover size="sm">
            <thead className="sticky-top bg-white">
              <tr>
                <th>{translate('Arrow Customer')}</th>
                <th>{translate('Reference')}</th>
                <th style={{ width: '40%' }}>
                  {translate('Waldur Organization')}
                </th>
              </tr>
            </thead>
            <tbody>
              {values.customers.map((customer) => {
                const suggestion = getSuggestionForCustomer(customer.reference);
                const currentValue =
                  values.selectedMappings[customer.reference];

                return (
                  <tr key={customer.reference}>
                    <td>
                      <strong>{customer.companyName}</strong>
                      {suggestion?.existing_mapping && (
                        <span className="badge bg-info ms-2">
                          {translate('Already mapped')}
                        </span>
                      )}
                    </td>
                    <td>{customer.reference}</td>
                    <td>
                      <Select
                        value={waldurCustomerOptions.find(
                          (o) => o.value === currentValue,
                        )}
                        onChange={(option) =>
                          handleMappingChange(
                            customer.reference,
                            option?.value || null,
                          )
                        }
                        options={waldurCustomerOptions}
                        isClearable
                        placeholder={translate('Select organization...')}
                        isDisabled={suggestion?.existing_mapping}
                      />
                      {suggestion?.suggested_waldur_customer &&
                        !suggestion.existing_mapping && (
                          <small className="text-muted">
                            {translate('Suggested: {name}', {
                              name: suggestion.suggested_waldur_customer.name,
                            })}
                          </small>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </BTable>
        </div>
      )}

      <div className="d-flex align-items-center">
        <span className="text-muted">
          {translate('{count} mappings selected', { count: mappingCount })}
        </span>
      </div>
    </WizardModal>
  );
};
