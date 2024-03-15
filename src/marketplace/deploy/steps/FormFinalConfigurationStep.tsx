import { DateTime } from 'luxon';
import { Field } from 'redux-form';

import { getNameFieldValidators } from '@waldur/core/validators';
import { FormGroup, StringField, TextField } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';

import { FormStepProps } from '../types';

export const FormFinalConfigurationStep = (props: FormStepProps) => {
  const defaultOffsetDays =
    props.offering.plugin_options?.default_resource_termination_offset_in_days;
  const maxOffsetDays =
    props.offering.plugin_options?.max_resource_termination_offset_in_days;
  const isTerminationDateRequired =
    props.offering.plugin_options?.is_resource_termination_date_required;

  const dateFieldProps: any = {
    minDate: DateTime.local().plus({ weeks: 1 }).toISODate(),
  };

  if (isTerminationDateRequired === true) {
    dateFieldProps.defaultDate = DateTime.local()
      .plus({ days: defaultOffsetDays })
      .toISODate();
    dateFieldProps.maxDate = DateTime.local()
      .plus({ days: maxOffsetDays })
      .toISODate();
    dateFieldProps.isClearable = !isTerminationDateRequired;
  }

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
      <Field
        name="attributes.end_date"
        label={translate('Termination date')}
        component={FormGroup}
        description={translate(
          'The date is inclusive. Once reached, resource will be scheduled for termination.',
        )}
        floating
      >
        <DateField {...dateFieldProps} />
      </Field>
    </StepCard>
  );
};
