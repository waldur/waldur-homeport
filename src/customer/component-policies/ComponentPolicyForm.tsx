import { useQuery } from '@tanstack/react-query';
import { lowerCase, upperFirst } from 'lodash-es';
import { FC, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import {
  Customer,
  marketplaceCustomerComponentUsagePoliciesActionsRetrieve,
  marketplaceProviderOfferingsList,
  Offering,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { composeValidators, required } from '@/core/validators';
import { FieldError, SelectGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';

import { validateEmails } from '../cost-policies/utils';

import { ComponentLimitsField } from './ComponentLimitsField';

interface ComponentPolicyFormProps {
  actions: { value; label };
  customer: Customer;
  errors?: any;
}

export const ComponentPolicyForm: FC<ComponentPolicyFormProps> = ({
  actions,
  customer,
  errors = null,
}) => {
  const {
    data: components,
    isLoading: isLoadingComponents,
    error: errorComponents,
    refetch: refetchComponents,
  } = useQuery({
    queryKey: ['provider-offering-components', customer.uuid],
    queryFn: () =>
      getAllPages<Offering>((page) =>
        marketplaceProviderOfferingsList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            customer_uuid: customer.uuid,
            field: ['name', 'uuid', 'components', 'type', 'category_title'],
          },
        }),
      ).then((options) => {
        return options.flatMap((offering) =>
          offering.components?.length
            ? offering.components
                .filter((c) => ['usage', 'limit'].includes(c.billing_type))
                .map((c) => ({
                  uuid: c.uuid,
                  name: c.name,
                  type: c.type,
                  measured_unit: c.measured_unit,
                  offering_name: offering.name, // to provide context in case of components with the same name
                }))
            : [],
        );
      }),
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const { data, isLoading, error, refetch } = useQuery<{}, {}, string[]>({
    queryKey: ['component-usage-policy-actions'],
    queryFn: () =>
      marketplaceCustomerComponentUsagePoliciesActionsRetrieve().then(
        (r) => r.data,
      ),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const actionOptions = useMemo(
    () =>
      (data || []).map((action) => ({
        label: upperFirst(lowerCase(action)),
        value: action,
      })),
    [data],
  );

  return (
    <>
      {isLoadingComponents ? (
        <LoadingSpinner />
      ) : errorComponents ? (
        <LoadingErred loadData={refetchComponents} />
      ) : (
        <ComponentLimitsField components={components} />
      )}
      {error && !isLoading && <LoadingErred loadData={refetch} />}
      <SelectGroup
        name="actions"
        placeholder={translate(
          'Select action to take when the condition is met...',
        )}
        validate={required}
        required
        options={actionOptions}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        isLoading={isLoading}
        label={translate('Then')}
      />
      {actions?.value === 'notify_external_user' && (
        <StringGroup
          name="options.notify_external_user"
          placeholder={translate(
            'Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)',
          )}
          validate={composeValidators(required, validateEmails)}
          label={translate('External user emails')}
          required
        />
      )}
      {!!errors && (
        <Form.Group>
          <FieldError error={errors} />
        </Form.Group>
      )}
    </>
  );
};
