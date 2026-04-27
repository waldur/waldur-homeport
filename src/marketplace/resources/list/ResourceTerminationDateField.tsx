import { FC } from 'react';
import { Resource } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { WarnTip } from '@/core/WarnTip';
import { translate } from '@/i18n';

interface ResourceTerminationDateFieldProps {
  row: Resource;
  format?: boolean;
}

export const ResourceTerminationDateField: FC<
  ResourceTerminationDateFieldProps
> = ({ row, format }) => {
  if (!row.end_date) return 'N/A';
  return (
    <>
      {format ? formatDate(row.end_date) : row.end_date}
      {(row.project_effective_end_date || row.project_end_date) &&
        row.end_date >
          (row.project_effective_end_date || row.project_end_date) && (
          <WarnTip
            id={row.uuid}
            label={translate(
              'Resource will terminate at project end as termination date exceeds project duration.',
            )}
            hasSpace
          />
        )}
    </>
  );
};
