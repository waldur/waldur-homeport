import { Field } from 'redux-form';

import { FormGroup } from '@waldur/form';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

import { OpenStackAllocationPool } from '../OpenStackAllocationPool';
import { OpenStackSubnetField } from '../OpenStackSubnetField';
import { validateSubnetPrivateCIDR } from '../utils';

export const FormInternalNetworkStep = (props: FormStepProps) => {
  return (
    <VStepperFormStepCard
      title={translate('Internal network')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
    >
      <Field
        name="attributes.subnet_cidr"
        component={FormGroup}
        label={translate('Internal network mask (CIDR)')}
        validate={validateSubnetPrivateCIDR}
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
    </VStepperFormStepCard>
  );
};
