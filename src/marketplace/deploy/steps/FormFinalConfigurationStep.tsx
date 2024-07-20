import { Field } from 'redux-form';

import { FormGroup, TextField } from '@waldur/form';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';

import { FormStepProps } from '../types';

import { ResourceNameGroup } from './ResourceNameGroup';
import { TerminationDateField } from './TerminationDateField';

export const FormFinalConfigurationStep = (props: FormStepProps) => {
  return (
    <VStepperFormStepCard
      title={translate('Final configuration')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
    >
      <ResourceNameGroup
        nameValidate={props.params?.nameValidate}
        nameLabel={props.params?.nameLabel}
        offering={props.offering}
      />
      <Field
        name="attributes.description"
        component={FormGroup}
        maxLength={1000}
        label={translate('Description')}
        floating
      >
        <TextField />
      </Field>
      <TerminationDateField offering={props.offering} />
    </VStepperFormStepCard>
  );
};
