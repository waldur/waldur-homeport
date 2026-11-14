import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';

import { formatDate, lastAccessDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { LayoutWarningBar } from '@/navigation/LayoutWarningBar';
import { useProject } from '@/workspace/hooks';

import { getEndDateStatus } from './endDateStatus';

export const GracePeriodWarningBar: FC = () => {
  const project = useProject();
  const { state } = useCurrentStateAndParams();

  const isProjectPage =
    state?.name?.startsWith('project.') || state?.name?.startsWith('project-');

  if (!project || !isProjectPage || !project.effective_end_date) {
    return null;
  }

  // Decided from the dates: on the effective end date the backend still
  // reports is_in_grace_period, but the project has already expired.
  const status = getEndDateStatus(project, 0);
  if (status?.kind !== 'expired' && status?.kind !== 'grace') {
    return null;
  }
  const isExpired = status.kind === 'expired';

  const endDate = formatDate(project.end_date);
  const effectiveEndDate = formatDate(project.effective_end_date);

  return (
    <LayoutWarningBar
      title={
        isExpired ? (
          <span className="text-danger">{translate('Project expired')}:</span>
        ) : (
          `${translate('Grace period active')}:`
        )
      }
    >
      {isExpired ? (
        translate(
          'This project expired on {effectiveEndDate}. Active resources are scheduled for termination.',
          { effectiveEndDate },
        )
      ) : (
        <GracePeriodMessage
          endDate={endDate}
          // Resources are terminated at the start of effective_end_date, so
          // the day to name is the one before it.
          lastActiveDate={formatDate(
            lastAccessDate(project.effective_end_date),
          )}
          daysRemaining={status.daysLeft}
        />
      )}
    </LayoutWarningBar>
  );
};

const GracePeriodMessage: FC<{
  endDate: string;
  lastActiveDate: string;
  daysRemaining: number;
}> = ({ endDate, lastActiveDate, daysRemaining }) => {
  const urgencyClass =
    daysRemaining <= 3
      ? 'text-danger font-medium'
      : daysRemaining <= 7
        ? 'text-warning font-medium'
        : 'font-medium';

  return (
    <>
      {translate(
        'This project ended on {endDate}. Resources will remain active until the end of {lastActiveDate}.',
        { endDate, lastActiveDate },
      )}{' '}
      <span className={urgencyClass}>
        {daysRemaining <= 0
          ? translate('Today is the last day')
          : daysRemaining === 1
            ? translate('1 day remaining')
            : translate('{daysRemaining} days remaining', {
                daysRemaining: String(daysRemaining),
              })}
      </span>
      .
    </>
  );
};
