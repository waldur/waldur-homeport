import { Question } from '@phosphor-icons/react';

import { formatRelative } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const EndDateField = ({ resource }) => {
  const ResourceTerminationDate = resource.end_date;
  const projectEndDate = resource.project_end_date;

  if (!ResourceTerminationDate && !projectEndDate) {
    return null;
  }

  const closestDate =
    ResourceTerminationDate && projectEndDate
      ? ResourceTerminationDate < projectEndDate
        ? ResourceTerminationDate
        : projectEndDate
      : ResourceTerminationDate || projectEndDate;

  const isPastDate = closestDate < new Date();

  const tooltipContent = (
    <div className="flex-grow-1">
      {ResourceTerminationDate && (
        <div>
          {translate('Resource termination date')}: {ResourceTerminationDate} (
          {formatRelative(ResourceTerminationDate)})
        </div>
      )}
      {projectEndDate && (
        <div>
          {translate('Project end date')}: {projectEndDate} (
          {formatRelative(projectEndDate)})
        </div>
      )}
    </div>
  );

  return (
    <Field
      label={translate('Termination date')}
      value={
        <span className={isPastDate ? 'text-danger' : ''}>
          {closestDate} ({formatRelative(closestDate)})
          {ResourceTerminationDate && projectEndDate && (
            <Tip id="end-date-tooltip" label={tooltipContent}>
              <Question size={15} />
            </Tip>
          )}
        </span>
      }
    />
  );
};
