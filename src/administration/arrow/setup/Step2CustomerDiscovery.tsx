import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Table as BTable } from 'react-bootstrap';
import type {
  ArrowCredentialsRequest,
  ArrowCustomerDiscovery,
  CustomerMappingSuggestion,
  WaldurCustomerBrief,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

import { useDiscoverArrowCustomers } from '../api';

interface Step2CustomerDiscoveryProps {
  credentials: ArrowCredentialsRequest;
  onMapped: (selectedMappings: Map<string, string>) => void;
  onBack: () => void;
  onCancel: () => void;
}

export const Step2CustomerDiscovery = ({
  credentials,
  onMapped,
  onBack,
  onCancel,
}: Step2CustomerDiscoveryProps) => {
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<ArrowCustomerDiscovery[]>([]);
  const [waldurCustomers, setWaldurCustomers] = useState<WaldurCustomerBrief[]>(
    [],
  );
  const [suggestions, setSuggestions] = useState<CustomerMappingSuggestion[]>(
    [],
  );
  const [mappings, setMappings] = useState<Map<string, string>>(new Map());
  const discoverCustomers = useDiscoverArrowCustomers();

  // Discover customers on mount
  useEffect(() => {
    const discover = async () => {
      try {
        const response = await discoverCustomers.mutateAsync({
          api_url: credentials.api_url,
          api_key: credentials.api_key,
        });
        const data = response.data;
        setCustomers(data.arrow_customers || []);
        setWaldurCustomers(data.waldur_customers || []);
        setSuggestions(data.suggestions || []);

        // Pre-populate mappings from suggestions
        const initialMappings = new Map<string, string>();
        (data.suggestions || []).forEach((suggestion) => {
          if (
            suggestion.suggested_waldur_customer &&
            suggestion.confidence &&
            suggestion.confidence > 0.7
          ) {
            initialMappings.set(
              suggestion.arrow_customer.reference,
              suggestion.suggested_waldur_customer.uuid,
            );
          }
        });
        setMappings(initialMappings);
      } catch (e: any) {
        setError(
          e.response?.data?.detail ||
            e.message ||
            translate('Failed to discover customers'),
        );
      }
    };
    discover();
  }, [credentials]);

  const waldurCustomerOptions = useMemo(
    () =>
      waldurCustomers.map((c) => ({
        value: c.uuid,
        label: c.name,
      })),
    [waldurCustomers],
  );

  const handleMappingChange = useCallback(
    (arrowRef: string, waldurUuid: string | null) => {
      setMappings((prev) => {
        const next = new Map(prev);
        if (waldurUuid) {
          next.set(arrowRef, waldurUuid);
        } else {
          next.delete(arrowRef);
        }
        return next;
      });
    },
    [],
  );

  const handleContinue = useCallback(() => {
    onMapped(mappings);
  }, [mappings, onMapped]);

  const getSuggestionForCustomer = useCallback(
    (arrowRef: string) => {
      return suggestions.find((s) => s.arrow_customer.reference === arrowRef);
    },
    [suggestions],
  );

  if (discoverCustomers.isPending) {
    return (
      <div className="text-center py-10">
        <LoadingSpinner />
        <p className="mt-4 text-muted">
          {translate('Discovering Arrow customers...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
        <div className="d-flex justify-content-end gap-2">
          <ActionButton
            action={onCancel}
            variant="secondary"
            title={translate('Cancel')}
          />
          <ActionButton
            action={onBack}
            variant="tertiary"
            title={translate('Back')}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="mb-4">{translate('Map Arrow Customers to Waldur')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'Select which Waldur organization each Arrow customer should be mapped to. High-confidence suggestions are pre-selected.',
        )}
      </p>

      {customers.length === 0 ? (
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
              {customers.map((customer) => {
                const suggestion = getSuggestionForCustomer(customer.reference);
                const currentValue = mappings.get(customer.reference);

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
                    <td>
                      <code>{customer.reference}</code>
                    </td>
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

      <div className="d-flex justify-content-between align-items-center">
        <span className="text-muted">
          {translate('{count} mappings selected', { count: mappings.size })}
        </span>
        <div className="d-flex gap-2">
          <ActionButton
            action={onCancel}
            variant="secondary"
            title={translate('Cancel')}
          />
          <ActionButton
            action={onBack}
            variant="tertiary"
            title={translate('Back')}
          />
          <ActionButton
            action={handleContinue}
            variant="primary"
            title={translate('Continue')}
          />
        </div>
      </div>
    </div>
  );
};
