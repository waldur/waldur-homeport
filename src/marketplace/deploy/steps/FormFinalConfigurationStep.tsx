import { Field } from 'redux-form';

import { getNameFieldValidators } from '@waldur/core/validators';
import { FormGroup, StringField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';

import { FormStepProps } from '../types';

import { StepCard } from './StepCard';

export const FormFinalConfigurationStep = (props: FormStepProps) => {
  return (
    <StepCard
      title={translate('Final configuration')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
    >
      <Field
        name="attributes.name"
        component={FormGroup}
        label={props.params?.nameLabel || translate('Name')}
        description={translate('This name will be visible in accounting data.')}
        validate={props.params?.nameValidate || getNameFieldValidators()}
        required
        floating
      >
        <StringField />
      </Field>
      <Field
        name="attributes.description"
        component={FormGroup}
        maxLength={1000}
        label={translate('Description')}
        floating
      >
        <TextField />
      </Field>
    </StepCard>
  );
};
