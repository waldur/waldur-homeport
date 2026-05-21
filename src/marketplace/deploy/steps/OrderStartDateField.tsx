import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { Field } from 'react-final-form';

import { ENV } from '@/core/config';
import { FormGroup } from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { Project } from '@/workspace/types';

interface OrderStartDateFieldProps {
  project: Project;
  simple?: boolean;
}

export const OrderStartDateField = ({
  project,
  simple,
}: OrderStartDateFieldProps) => {
  // 1. Check if the feature is enabled from the global config
  const isEnabled = ENV.plugins.WALDUR_CORE.ENABLE_ORDER_START_DATE;

  // 2. Memoize date calculations for performance
  const dateFieldProps = useOrderStartDateBounds(project);

  // 3. Do not render anything if the feature is disabled
  if (!isEnabled) {
    return null;
  }

  // 4. Render the React Final Form Field
  return (
    <Field
      name="start_date" // This field is at the root of the order payload
      label={translate('Start date')}
      component={simple ? DateField : FormGroup}
      description={
        !simple &&
        translate(
          'The date when the resource provisioning will be initiated. If not set, the order is processed immediately after approval.',
        )
      }
      {...(simple ? dateFieldProps : {})}
    >
      {!simple && <DateField {...dateFieldProps} />}
    </Field>
  );
};

export const useOrderStartDateBounds = (project: Project) => {
  return useMemo(() => {
    if (!project) {
      return {
        minDate: DateTime.local().plus({ days: 1 }).toISODate(),
        isClearable: true, // This field is optional
      };
    }

    // The earliest possible start date is tomorrow.
    const tomorrow = DateTime.local().plus({ days: 1 });

    // If the project has a future start date, that becomes the earliest possible date.
    let minDate = tomorrow;
    if (project.start_date) {
      const projectStartDate = DateTime.fromISO(project.start_date);
      if (projectStartDate > tomorrow) {
        minDate = projectStartDate;
      }
    }

    // The latest possible start date is the project's end date, if it is set.
    const maxDate = project.end_date
      ? DateTime.fromISO(project.end_date)
      : undefined;

    return {
      minDate: minDate.toISODate(),
      maxDate: maxDate?.toISODate(),
      isClearable: true, // This field is optional
    };
  }, [project]);
};
