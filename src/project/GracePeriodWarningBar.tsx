import { WarningCircleIcon } from '@phosphor-icons/react';
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

  if (!project || !isProjectPage || !project.effective_end_date) {
    return null;
  }

  const today = new Date();
  const effectiveEndDateObj = new Date(project.effective_end_date);
  const isExpired = effectiveEndDateObj < today;
  const isInGracePeriod = project.is_in_grace_period;

  if (!isExpired && !isInGracePeriod) {
    return null;
  }

  const endDate = formatDate(project.end_date);
  const effectiveEndDate = formatDate(project.effective_end_date);

  return (
    <div className="layout-warning-bar bar-warning">
      <div className="container-fluid w-100 d-flex align-items-center gap-2">
        {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
        <FeaturedIcon
          IconComponent={WarningCircleIcon}
          variant="warning"
          size="sm"
        />
        <p className="text-start fs-6 mb-0">
          {isExpired ? (
            <>
              <strong className="fw-bold text-danger">
                {translate('Project expired')}:{' '}
              </strong>
              {translate(
                'This project expired on {effectiveEndDate}. Active resources are scheduled for termination.',
                { effectiveEndDate },
              )}
            </>
          ) : (
            <GracePeriodMessage
              endDate={endDate}
              effectiveEndDate={effectiveEndDate}
              effectiveEndDateObj={effectiveEndDateObj}
            />
          )}
        </p>
      </div>
    </div>
  );
};

const GracePeriodMessage: FC<{
  endDate: string;
  effectiveEndDate: string;
  effectiveEndDateObj: Date;
}> = ({ endDate, effectiveEndDate, effectiveEndDateObj }) => {
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (effectiveEndDateObj.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  const urgencyClass =
    daysRemaining <= 3
      ? 'text-danger fw-bold'
      : daysRemaining <= 7
        ? 'text-warning fw-bold'
        : 'fw-bold';

  return (
    <>
      <strong className="fw-bold">{translate('Grace period active')}: </strong>
      {translate(
        'This project ended on {endDate}. Resources will remain active until {effectiveEndDate}.',
        { endDate, effectiveEndDate },
      )}{' '}
      <span className={urgencyClass}>
        {translate('{daysRemaining} days remaining', {
          daysRemaining: String(daysRemaining),
        })}
      </span>
      .
    </>
  );
};
