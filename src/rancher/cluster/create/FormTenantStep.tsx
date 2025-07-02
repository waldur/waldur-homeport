import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';
import { openstackTenantsList } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { required } from '@waldur/core/validators';
import { FormGroup, SelectField } from '@waldur/form';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { orderProjectSelector } from '@waldur/marketplace/deploy/selectors';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

export const FormTenantStep = (props: FormStepProps) => {
  const project = useSelector(orderProjectSelector);
  const { data, isLoading } = useQuery({
    queryKey: ['tenant-step', project?.uuid],

    queryFn: () =>
      project
        ? getAllPages((page) =>
            openstackTenantsList({
              query: {
                page,
                project_uuid: project.uuid,
                field: ['name', 'url', 'uuid'],
              },
            }),
          )
        : null,

    staleTime: 3 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.length === 1) {
      props.change('attributes.tenant', data[0]);
    }
  }, [data]);

  return (
    <VStepperFormStepCard
      title={translate('Tenant')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
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
