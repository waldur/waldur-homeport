import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { marketplaceResourcesList, Project } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { Badge } from '@waldur/core/Badge';
import { formatDate, parseDate } from '@waldur/core/dateUtils';
import { WarnTip } from '@waldur/core/WarnTip';
import { translate } from '@waldur/i18n';
import { NON_TERMINATED_STATES } from '@waldur/marketplace/resources/list/constants';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

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

    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  return row.end_date ? (
    <>
      {formatDate(projectEndDate)}
      {row.grace_period_days > 0 && (
        <Badge variant="secondary" size="sm" pill outline className="ms-1">
          {translate('+{count}d grace', { count: row.grace_period_days })}
        </Badge>
      )}
      {row.is_in_grace_period && (
        <Badge variant="warning" size="sm" pill outline className="ms-1">
          {translate('In grace period')}
        </Badge>
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
