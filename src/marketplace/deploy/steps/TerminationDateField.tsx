import { DateTime } from 'luxon';
import { useEffect } from 'react';
import { useForm } from 'react-final-form';

import { DateGroup } from '@/form';
import { translate } from '@/i18n';

import { useOrderFormData } from '../selectors';

export interface ResourceTerminationPluginOptions {
  default_resource_termination_offset_in_days?: number;
  max_resource_termination_offset_in_days?: number;
  latest_date_for_resource_termination?: string;
  is_resource_termination_date_required?: boolean;
}

export interface TerminationDateBoundsOptions {
  now?: DateTime;
  /** Order start date — offsets are measured from this when set in the future. */
  startDate?: string | null;
  /** Project end date — hard ceiling for selectable termination date. */
  projectEndDate?: string | null;
  /**
   * Creation timestamp of an existing resource. When set, offsets are measured
   * from it (or a later order start), as the set_end_date API does, rather
   * than from today.
   */
  createdDate?: string | null;
}

export interface TerminationDateBounds {
  minDate: string;
  maxDate?: string;
  /** False when no date satisfies every constraint (e.g. project has ended). */
  hasValidRange: boolean;
}

function earliestDate(
  ...dates: (DateTime | undefined)[]
): DateTime | undefined {
  const valid = dates.filter((d): d is DateTime => Boolean(d?.isValid));
  if (valid.length === 0) return undefined;
  return valid.reduce((a, b) => (a < b ? a : b));
}

function latestDateTime(
  ...dates: (DateTime | undefined)[]
): DateTime | undefined {
  const valid = dates.filter((d): d is DateTime => Boolean(d?.isValid));
  if (valid.length === 0) return undefined;
  return valid.reduce((a, b) => (a > b ? a : b));
}

export function getTerminationDateProps(
  pluginOptions: ResourceTerminationPluginOptions | undefined,
  options: TerminationDateBoundsOptions = {},
) {
  const now = options.now ?? DateTime.local();
  const orderStart = options.startDate
    ? DateTime.fromISO(options.startDate)
    : undefined;
  const projectEnd = options.projectEndDate
    ? DateTime.fromISO(options.projectEndDate)
    : undefined;

  // The API takes the calendar date of the UTC creation timestamp.
  const created = options.createdDate
    ? DateTime.fromISO(
        DateTime.fromISO(options.createdDate, { zone: 'utc' }).toISODate(),
      )
    : undefined;

  let offsetBase: DateTime;
  if (created?.isValid) {
    offsetBase =
      orderStart?.isValid && orderStart > created ? orderStart : created;
  } else {
    offsetBase = orderStart?.isValid && orderStart > now ? orderStart : now;
  }

  const minDate = latestDateTime(now, orderStart) ?? now;

  const defaultOffsetDays =
    pluginOptions?.default_resource_termination_offset_in_days;
  const maxOffsetDays = pluginOptions?.max_resource_termination_offset_in_days;
  const latestTermination = pluginOptions?.latest_date_for_resource_termination
    ? DateTime.fromISO(pluginOptions.latest_date_for_resource_termination)
    : undefined;
  const isTerminationDateRequired =
    pluginOptions?.is_resource_termination_date_required;

  const props: {
    minDate: string;
    maxDate?: string;
    defaultDate?: string;
    isClearable?: boolean;
    hasValidRange: boolean;
  } = {
    minDate: minDate.toISODate(),
    hasValidRange: true,
  };

  let maxDate: DateTime | undefined;

  if (typeof maxOffsetDays === 'number' && maxOffsetDays > 0) {
    maxDate = offsetBase.plus({ days: maxOffsetDays });
  }

  if (latestTermination?.isValid) {
    maxDate = earliestDate(maxDate, latestTermination);
  }

  // Always respect project end date as a ceiling (matches edit-resource dialog).
  if (projectEnd?.isValid) {
    maxDate = earliestDate(maxDate, projectEnd);
  }

  if (maxDate) {
    props.hasValidRange = maxDate.toISODate() >= props.minDate;
    // Keep the picker usable if constraints somehow invert.
    props.maxDate =
      maxDate < minDate ? minDate.toISODate() : maxDate.toISODate();
  }

  if (isTerminationDateRequired === true) {
    let defaultDate = offsetBase.plus({ days: defaultOffsetDays ?? 0 });
    if (props.maxDate) {
      const max = DateTime.fromISO(props.maxDate);
      if (defaultDate > max) {
        defaultDate = max;
      }
    }
    if (defaultDate < minDate) {
      defaultDate = minDate;
    }
    props.defaultDate = defaultDate.toISODate();
    props.isClearable = false;
  }

  return props;
}

/**
 * Narrows several resources' bounds to the dates valid for all of them:
 * latest minimum, earliest maximum.
 */
export function intersectTerminationDateBounds(
  bounds: TerminationDateBounds[],
): TerminationDateBounds {
  const minDate = bounds.reduce(
    (latest, b) => (b.minDate > latest ? b.minDate : latest),
    bounds[0]?.minDate ?? getTerminationDateProps(undefined).minDate,
  );
  const maxDate = bounds.reduce<string | undefined>(
    (earliest, b) =>
      b.maxDate && (!earliest || b.maxDate < earliest) ? b.maxDate : earliest,
    undefined,
  );
  return {
    minDate,
    maxDate,
    hasValidRange:
      bounds.every((b) => b.hasValidRange) && (!maxDate || maxDate >= minDate),
  };
}

export const TerminationDateField = ({
  offering,
}: {
  offering: { plugin_options?: ResourceTerminationPluginOptions };
}) => {
  const form = useForm();
  const { project, start_date: startDate, attributes } = useOrderFormData();
  const projectEndDate = project?.end_date;

  const { hasValidRange: _hasValidRange, ...dateFieldProps } =
    getTerminationDateProps(offering.plugin_options, {
      startDate,
      projectEndDate,
    });

  // When start date / project bounds change, clamp an out-of-range value so
  // the form stays submittable and matches what the picker allows.
  useEffect(() => {
    const current = attributes?.end_date as string | undefined;
    if (!current) {
      if (dateFieldProps.defaultDate) {
        form.change('attributes.end_date', dateFieldProps.defaultDate);
      }
      return;
    }

    const currentDate = DateTime.fromISO(current);
    if (!currentDate.isValid) return;

    const min = DateTime.fromISO(dateFieldProps.minDate);
    const max = dateFieldProps.maxDate
      ? DateTime.fromISO(dateFieldProps.maxDate)
      : undefined;

    if (currentDate < min) {
      form.change('attributes.end_date', dateFieldProps.minDate);
    } else if (max && currentDate > max) {
      form.change('attributes.end_date', dateFieldProps.maxDate);
    }
  }, [
    startDate,
    projectEndDate,
    dateFieldProps.minDate,
    dateFieldProps.maxDate,
    dateFieldProps.defaultDate,
    attributes?.end_date,
    form,
  ]);

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
