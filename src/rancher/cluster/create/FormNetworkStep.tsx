import { PlusIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-final-form';

import { UI_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { StepCardPlaceholder } from '@/marketplace/deploy/steps/StepCardPlaceholder';
import { FormStepProps } from '@/marketplace/deploy/types';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { CompactActionButton } from '@/table/CompactActionButton';
import { VStepperFormStepCard } from '@/wizard';

import { formatSubnets, useFormTenant } from './utils';

export const FormNetworkStep = (props: FormStepProps) => {
  const tenant = useFormTenant();
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const form = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['network-step', tenant?.url],
    queryFn: () => (tenant ? formatSubnets(tenant.uuid) : []),
    staleTime: UI_STALE_TIME,
  });

  useEffect(() => {
    if (data?.length === 1) {
      form.change('attributes.subnet', data[0].value);
    }
  }, [data, form]);

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
        <SelectGroup
          name="attributes.subnet"
          label={translate('Subnet')}
          validate={required}
          parse={(subnet: any) => subnet?.value}
          required={true}
          options={data}
          placeholder={translate('Select subnet...')}
        />
      ) : (
        <StepCardPlaceholder>
          {translate('Please select a tenant first')}
        </StepCardPlaceholder>
      )}
    </VStepperFormStepCard>
  );
};
