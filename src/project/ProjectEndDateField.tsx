import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { marketplaceResourcesList, Project } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { FAST_STALE_TIME } from '@/core/constants';
import { formatDate, parseDate } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { WarnTip } from '@/core/WarnTip';
import { translate } from '@/i18n';
import { NON_TERMINATED_STATES } from '@/marketplace/resources/list/constants';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { ProjectLifecycleBadge } from './ProjectLifecycleBadge';

export const ProjectEndDateField: FC<{ row: Project }> = ({ row }) => {
  const projectEndDate = row.end_date
    ? parseDate(row.end_date)
    : DASH_ESCAPE_CODE;

  const { data: endDates } = useQuery({
    queryKey: ['project-resources-end', row.uuid],

    queryFn: () => {
      if (
        !row.resources_count ||
        !row.end_date ||
        projectEndDate < parseDate(null)
      )
        return Promise.resolve(null);

      return getAllPages((page) =>
        marketplaceResourcesList({
          query: {
            page,
            field: ['end_date'],
            project_uuid: row.uuid,
            state: NON_TERMINATED_STATES,
            has_terminate_date: true,
          },
        }),
      ).then((res) => res.map((item) => item.end_date));
    },

    staleTime: FAST_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const graceDays =
    row.effective_end_date &&
    row.end_date &&
    row.effective_end_date !== row.end_date
      ? Math.round(
          (new Date(row.effective_end_date).getTime() -
            new Date(row.end_date).getTime()) /
            86400000,
        )
      : 0;

  // Hide the +Nd grace-duration indicator when the lifecycle badge already
  // conveys the project's state (in-grace or expired). It would otherwise
  // be redundant ('In grace' badge + '+23d') or misleading on expired
  // projects (the configured grace is over).
  const showGraceDuration =
    graceDays > 0 &&
    !row.is_in_grace_period &&
    (!row.effective_end_date || new Date(row.effective_end_date) >= new Date());

  return row.end_date ? (
    <>
      {formatDate(projectEndDate)}
      <ProjectLifecycleBadge project={row} className="ms-1" />
      {showGraceDuration && (
        <Tip
          id={`grace-${row.uuid}`}
          className="ms-1 fs-8 text-muted"
          label={translate('Grace period until {date}', {
            date: formatDate(row.effective_end_date),
          })}
        >
          +{graceDays}d
        </Tip>
      )}
      {endDates?.length
        ? endDates.some((date) => parseDate(date) > projectEndDate) && (
            <WarnTip
              id={row.uuid}
              label={translate(
                "Some of the resources' termination dates are beyond the project end date. Resource termination will begin on the project's end date.",
              )}
              hasSpace
              autoWidth
              className="w-100"
              tipClassName="mw-300px"
            />
          )
        : null}
    </>
  ) : (
    DASH_ESCAPE_CODE
  );
};
