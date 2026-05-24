import { useMemo } from 'react';
import { FormLabel } from 'react-bootstrap';

import { loadLocationOptions } from '@/azure/vm/utils';
import { required } from '@/core/validators';
import { AsyncSelectField } from '@/form/select/AsyncSelectField';
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
      <FormLabel className="required">{translate('Location')}</FormLabel>
      <AsyncSelectField
        name="attributes.location"
        loadOptions={locationLoader}
        validate={required}
      />
    </VStepperFormStepCard>
  );
};
