import { DateTime } from 'luxon';
import { useMemo } from 'react';

import { Project } from '@/workspace/types';

export const useOrderStartDateBounds = (
  project: Pick<Project, 'start_date' | 'end_date'>,
) => {
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
