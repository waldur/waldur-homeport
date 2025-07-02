import { QuestionIcon } from '@phosphor-icons/react';

import { formatRelative } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { WarnTip } from '@waldur/core/WarnTip';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const EndDateField = ({ resource }) => {
  const resourceTerminationDate = resource.end_date;
  const projectEndDate = resource.project_end_date;

  if (!resourceTerminationDate && !projectEndDate) {
    return null;
  }

  const closestDate =
    resourceTerminationDate && projectEndDate
      ? resourceTerminationDate < projectEndDate
        ? resourceTerminationDate
        : projectEndDate
      : resourceTerminationDate || projectEndDate;

  const isPastDate = closestDate < new Date();

  const tooltipContent = (
    <div className="flex-grow-1">
      {resourceTerminationDate && (
        <div>
          {translate('Resource termination date')}: {resourceTerminationDate} (
          {formatRelative(resourceTerminationDate)})
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
          {closestDate} ({formatRelative(closestDate)}) &nbsp;
          {projectEndDate && resourceTerminationDate > projectEndDate ? (
            <WarnTip
              id={resource.uuid}
              label={
                <ul className="text-start mb-0">
                  <li>
                    {translate(
                      'Termination date exceeds project end date. Resource termination will start from the project end date.',
                    )}
                  </li>
                  <li>{translate('Resource will be terminated soon.')}</li>
                </ul>
              }
              hasSpace
              autoWidth
              className="w-100"
              tipClassName="mw-275px"
            />
          ) : resourceTerminationDate && projectEndDate ? (
            <Tip id="end-date-tooltip" label={tooltipContent}>
              <QuestionIcon size={15} />
            </Tip>
          ) : null}
        </span>
      }
    />
  );
};
