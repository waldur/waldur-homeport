import { PlusIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { UI_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { FormGroup, SelectField } from '@/form';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { StepCardPlaceholder } from '@/marketplace/deploy/steps/StepCardPlaceholder';
import { FormStepProps } from '@/marketplace/deploy/types';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { CompactActionButton } from '@/table/CompactActionButton';

import { formTenantSelector, formatSubnets } from './utils';

export const FormNetworkStep = (props: FormStepProps) => {
  const tenant = useSelector(formTenantSelector);
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const { data, isLoading } = useQuery({
    queryKey: ['network-step', tenant?.url],
    queryFn: () => (tenant ? formatSubnets(tenant.uuid) : []),
    staleTime: UI_STALE_TIME,
  });

  useEffect(() => {
    if (data?.length === 1) {
      props.change('attributes.subnet', data[0].value);
    }
  }, [data]);

  return (
    <VStepperFormStepCard
      title={translate('Network')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
      actions={
        showExperimentalUiComponents ? (
          <div className="d-flex justify-content-end flex-grow-1">
            <CompactActionButton
              variant="tertiary"
              className="text-nowrap"
              action={() => {}}
              iconNode={<PlusIcon weight="bold" />}
              title={translate('New network')}
            />
          </div>
        ) : null
      }
    >
      {tenant ? (
        <Field
          name="attributes.subnet"
          component={FormGroup}
          label={translate('Subnet')}
          validate={required}
          parse={(subnet) => subnet.value}
          required={true}
        >
          <SelectField
            options={data}
            placeholder={translate('Select subnet...')}
          />
        </Field>
      ) : (
        <StepCardPlaceholder>
          {translate('Please select a tenant first')}
        </StepCardPlaceholder>
      )}
    </VStepperFormStepCard>
  );
};
