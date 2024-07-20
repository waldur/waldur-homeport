import { DateTime } from 'luxon';
import { Field } from 'redux-form';

import { FormGroup } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';

export const TerminationDateField = ({ offering }) => {
  const defaultOffsetDays =
    offering.plugin_options?.default_resource_termination_offset_in_days;
  const maxOffsetDays =
    offering.plugin_options?.max_resource_termination_offset_in_days;
  const isTerminationDateRequired =
    offering.plugin_options?.is_resource_termination_date_required;

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
  );
};
