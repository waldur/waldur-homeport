import { useToggle } from 'react-use';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { BooleanGroup, StringGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import { VStepperFormStepCard } from '@/wizard';

import { OpenStackAllocationPool } from '../OpenStackAllocationPool';
import { validatePrivateCIDR } from '../utils';

export const FormInternalNetworkStep = (props: FormStepProps) => {
  const [advancedEnabled, setAdvancedEnabled] = useToggle(false);

  return (
    <VStepperFormStepCard
      title={translate('Internal network')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
      actions={
        <div className="ms-auto">
          <AwesomeCheckbox
            value={advancedEnabled}
            onChange={setAdvancedEnabled}
            size="sm"
            className="align-self-center"
            label={translate('Advanced configuration')}
          />
        </div>
      }
    >
      <StringGroup
        name="attributes.subnet_cidr"
        label={translate('Internal network mask (CIDR)')}
        validate={validatePrivateCIDR}
      />
      <FormGroup
        id="attributes.subnet_allocation_pool"
        label={translate('Internal network allocation pool')}
      >
        <OpenStackAllocationPool />
      </FormGroup>
      {advancedEnabled && (
        <>
          <BooleanGroup
            name="attributes.skip_creation_of_default_router"
            label={translate('Skip creation of default router')}
          />
          <BooleanGroup
            name="attributes.skip_connection_extnet"
            label={translate('Skip connection to external network')}
          />
          <BooleanGroup
            name="attributes.skip_creation_of_default_subnet"
            label={translate('Skip creation of default subnet')}
          />
        </>
      )}
    </VStepperFormStepCard>
  );
};
