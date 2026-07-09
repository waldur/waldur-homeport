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
  // The effective end date already folds in the resource's own end date and the
  // grace-aware project termination date, so show it directly. N/A only when
  // nothing is scheduled to terminate the resource.
  const terminationDate = row.resource_effective_end_date;
  if (!terminationDate) return 'N/A';
  return (
    <>
      {format ? formatDate(terminationDate) : terminationDate}
      {row.end_date && row.end_date > terminationDate && (
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
