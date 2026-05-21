import { Field } from 'react-final-form';
import { useToggle } from 'react-use';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { FormGroup } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';

import { OpenStackAllocationPool } from '../OpenStackAllocationPool';
import { OpenStackSubnetField } from '../OpenStackSubnetField';
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
      <Field
        name="attributes.subnet_cidr"
        component={FormGroup}
        label={translate('Internal network mask (CIDR)')}
        validate={validatePrivateCIDR}
      >
        <OpenStackSubnetField />
      </Field>
      <Field
        name="attributes.subnet_allocation_pool"
        component={FormGroup}
        label={translate('Internal network allocation pool')}
      >
        <OpenStackAllocationPool />
      </Field>
      {advancedEnabled && (
        <>
          <Field
            name="attributes.skip_creation_of_default_router"
            component={FormGroup}
          >
            <AwesomeCheckboxField
              label={translate('Skip creation of default router')}
            />
          </Field>
          <Field name="attributes.skip_connection_extnet" component={FormGroup}>
            <AwesomeCheckboxField
              label={translate('Skip connection to external network')}
            />
          </Field>
          <Field
            name="attributes.skip_creation_of_default_subnet"
            component={FormGroup}
          >
            <AwesomeCheckboxField
              label={translate('Skip creation of default subnet')}
            />
          </Field>
        </>
      )}
    </VStepperFormStepCard>
  );
};
