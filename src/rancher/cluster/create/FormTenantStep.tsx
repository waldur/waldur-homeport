import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';
import { openstackTenantsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { FormGroup, SelectField } from '@/form';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { orderProjectSelector } from '@/marketplace/deploy/selectors';
import { FormStepProps } from '@/marketplace/deploy/types';

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
                page_size: MAX_PAGE_SIZE,
                project_uuid: project.uuid,
                field: ['name', 'url', 'uuid'],
              },
            }),
          )
        : null,

    staleTime: UI_STALE_TIME,
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
