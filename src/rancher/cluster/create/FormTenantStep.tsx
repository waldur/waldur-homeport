import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { getAll } from '@waldur/core/api';
import { required } from '@waldur/core/validators';
import { FormGroup, SelectField } from '@waldur/form';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { getCustomer } from '@waldur/workspace/selectors';

export const FormTenantStep = (props: FormStepProps) => {
  const customer = useSelector(getCustomer);
  const { data, isLoading } = useQuery(
    ['tenant-step', customer.uuid],
    () =>
      getAll<any>('/openstack-tenants/', {
        params: {
          customer_uuid: customer.uuid,
          field: ['name', 'url', 'uuid'],
        },
      }),
    { staleTime: 3 * 60 * 1000 },
  );

  useEffect(() => {
    if (data?.length === 1) {
      props.change('attributes.tenant', data[0]);
    }
  }, [data]);

  return (
    <VStepperFormStepCard
      title={translate('Tenant')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      loading={isLoading}
      disabled={props.disabled}
      required={props.required}
    >
      <Field name="attributes.tenant" component={FormGroup} validate={required}>
        <SelectField
          options={data}
          getOptionValue={(option) => option.url}
          getOptionLabel={(option) => option.name}
          isClearable={true}
        />
      </Field>
    </VStepperFormStepCard>
  );
};
