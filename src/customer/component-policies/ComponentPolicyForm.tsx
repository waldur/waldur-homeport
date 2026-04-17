import { useQuery } from '@tanstack/react-query';
import { lowerCase, upperFirst } from 'lodash-es';
import { FC, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import {
  Customer,
  marketplaceCustomerComponentUsagePoliciesActionsRetrieve,
  marketplaceProviderOfferingsList,
  Offering,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { STALE_TIME } from '@waldur/core/constants';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { composeValidators, required } from '@waldur/core/validators';
import { FieldError, SelectField, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

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

      <FormGroup label={translate('Then')} required>
        <Field
          name="actions"
          component={SelectField as any}
          placeholder={translate(
            'Select action to take when the condition is met...',
          )}
          validate={required}
          required
          options={actionOptions}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          isLoading={isLoading}
        />
      </FormGroup>

      {actions?.value === 'notify_external_user' && (
        <FormGroup label={translate('External user emails')} required>
          <Field
            name="options.notify_external_user"
            component={StringField as any}
            placeholder={translate(
              'Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)',
            )}
            validate={composeValidators(required, validateEmails)}
          />
        </FormGroup>
      )}

      {!!errors && (
        <Form.Group>
          <FieldError error={errors} />
        </Form.Group>
      )}
    </>
  );
};
