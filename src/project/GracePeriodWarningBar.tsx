import { ClockCountdownIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { formatDate } from '@waldur/core/dateUtils';
import { FeaturedIcon } from '@waldur/core/FeaturedIcon';
import { translate } from '@waldur/i18n';
import { getProject } from '@waldur/workspace/selectors';

export const GracePeriodWarningBar: FC = () => {
  const project = useSelector(getProject);
  const { state } = useCurrentStateAndParams();

  const isProjectPage =
    state?.name?.startsWith('project.') || state?.name?.startsWith('project-');

  if (!project || !project.is_in_grace_period || !isProjectPage) {
    return null;
  }

  const endDate = formatDate(project.end_date);
  const effectiveEndDate = formatDate(project.effective_end_date);
  const daysRemaining = project.effective_end_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(project.effective_end_date).getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <div className="bg-warning bg-opacity-10 border-warning border-opacity-25 border-bottom">
      <div className="container-fluid">
        <div className="d-flex align-items-center py-3">
          {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
          <FeaturedIcon
            IconComponent={ClockCountdownIcon}
            variant="warning"
            size="sm"
          />
          <span className="ms-2 text-warning">
            <strong>{translate('Grace period active')}:</strong>{' '}
            {translate(
              'This project ended on {endDate}. Resources will remain active until {effectiveEndDate} ({daysRemaining} days remaining).',
              {
                endDate,
                effectiveEndDate,
                daysRemaining: String(daysRemaining),
              },
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
