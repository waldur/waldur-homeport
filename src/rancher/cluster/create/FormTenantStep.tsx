import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { getAll } from '@waldur/core/api';
import { required } from '@waldur/core/validators';
import { FormGroup, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { getCustomer } from '@waldur/workspace/selectors';

const loadData = (customer_uuid) =>
  getAll<any>('/service-settings/', {
    params: {
      customer_uuid,
      shared: false,
      type: 'OpenStackTenant',
      field: ['name', 'url'],
    },
  });

export const FormTenantStep = (props: FormStepProps) => {
  const customer = useSelector(getCustomer);
  const { data, isLoading } = useQuery(
    ['tenant-step', customer.uuid],
    () => loadData(customer.uuid),
    { staleTime: 3 * 60 * 1000 },
  );

  useEffect(() => {
    if (data?.length === 1) {
      props.change('attributes.tenant_settings', data[0].url);
    }
  }, [data]);

  return (
    <StepCard
      title={translate('Tenant')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      loading={isLoading}
      disabled={props.disabled}
      required={props.required}
    >
      <Field
        name="attributes.tenant_settings"
        component={FormGroup}
        validate={required}
      >
        <SelectField
          options={data}
          simpleValue={true}
          getOptionValue={(option) => option.url}
          getOptionLabel={(option) => option.name}
          isClearable={true}
        />
      </Field>
    </StepCard>
  );
};
