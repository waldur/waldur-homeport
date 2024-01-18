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
    >
      <Field
        name="attributes.name"
        component={FormGroup}
        placeholder={props.params?.nameLabel || translate('Name')}
        description={translate('This name will be visible in accounting data.')}
        validate={props.params?.nameValidate || getNameFieldValidators()}
      >
        <StringField />
      </Field>
      <Field
        name="attributes.description"
        component={TextField}
        maxLength={1000}
        placeholder={translate('Description')}
      />
    </StepCard>
  );
};
