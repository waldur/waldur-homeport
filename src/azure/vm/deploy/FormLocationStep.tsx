import { useMemo } from 'react';

import { loadLocationOptions } from '@/azure/vm/utils';
import { required } from '@/core/validators';
import { AsyncSelectGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import { VStepperFormStepCard } from '@/wizard';

export const FormLocationStep = (props: FormStepProps) => {
  const locationLoader = useMemo(
    () => loadLocationOptions(props.offering.scope_uuid),
    [props.offering.scope_uuid],
  );

  return (
    <VStepperFormStepCard
      title={translate('Location')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <AsyncSelectGroup
        name="attributes.location"
        label={translate('Location')}
        required={true}
        loadOptions={locationLoader}
        validate={required}
      />
      <SelectGroup
        name="attributes.availability_zone"
        label={translate('Availability zone')}
        required={true}
        options={[
          { label: translate('First'), value: 1 },
          { label: translate('Second'), value: 2 },
          { label: translate('Third'), value: 3 },
        ]}
        validate={required}
      />
    </VStepperFormStepCard>
  );
};
