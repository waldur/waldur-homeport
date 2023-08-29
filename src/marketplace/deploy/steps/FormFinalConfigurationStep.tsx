import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { StringField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { validateOpenstackInstanceName } from '@waldur/openstack/openstack-instance/utils';

import { FormStepProps } from '../types';

import { StepCard } from './StepCard';

const nameValidators = [required, validateOpenstackInstanceName];

export const FormFinalConfigurationStep = (props: FormStepProps) => {
  return (
    <StepCard
      title={translate('Final configuration')}
      step={props.step}
      id={props.id}
      completed={props.observed}
    >
      <Field
        name="attributes.name"
        component={StringField}
        placeholder={translate('VM name')}
        className="form-control-solid mb-7"
        validate={nameValidators}
      />
      <Field
        name="attributes.description"
        component={TextField}
        maxLength={1000}
        placeholder={translate('Description')}
      />
    </StepCard>
  );
};
