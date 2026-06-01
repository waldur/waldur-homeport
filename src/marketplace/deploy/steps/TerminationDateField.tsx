import { DateTime } from 'luxon';

import { DateGroup } from '@/form';
import { translate } from '@/i18n';

interface PluginOptions {
  default_resource_termination_offset_in_days?: number;
  max_resource_termination_offset_in_days?: number;
  latest_date_for_resource_termination?: string;
  is_resource_termination_date_required?: boolean;
}

export function getTerminationDateProps(
  pluginOptions: PluginOptions | undefined,
  now: DateTime = DateTime.local(),
) {
  const defaultOffsetDays =
    pluginOptions?.default_resource_termination_offset_in_days;
  const maxOffsetDays = pluginOptions?.max_resource_termination_offset_in_days;
  const latestDate = pluginOptions?.latest_date_for_resource_termination;
  const isTerminationDateRequired =
    pluginOptions?.is_resource_termination_date_required;

  const props: any = {
    minDate: now.toISODate(),
  };

  if (isTerminationDateRequired === true) {
    props.defaultDate = now.plus({ days: defaultOffsetDays }).toISODate();
    if (maxOffsetDays) {
      props.maxDate = now.plus({ days: maxOffsetDays }).toISODate();
    }
    if (latestDate) {
      const latestIso = DateTime.fromISO(latestDate).toISODate();
      props.maxDate = props.maxDate
        ? DateTime.min(
            DateTime.fromISO(props.maxDate),
            DateTime.fromISO(latestIso),
          ).toISODate()
        : latestIso;
    }
    props.isClearable = !isTerminationDateRequired;
  }

  return props;
}

export const TerminationDateField = ({ offering }) => {
  const dateFieldProps = getTerminationDateProps(offering.plugin_options);

  return (
    <DateGroup
      name="attributes.end_date"
      label={translate('Termination date')}
      description={translate(
        'The date is inclusive. Once reached, resource will be scheduled for termination.',
      )}
      {...dateFieldProps}
    />
  );
};
