import { FC } from 'react';
import { Resource } from 'waldur-js-client';

import { WarnTip } from '@waldur/core/WarnTip';
import { translate } from '@waldur/i18n';

interface ResourceTerminationDateFieldProps {
  row: Resource;
}

export const ResourceTerminationDateField: FC<
  ResourceTerminationDateFieldProps
> = ({ row }) => {
  if (!row.end_date) return 'N/A';
  return (
    <>
      {row.end_date}
      {row.project_end_date && row.end_date > row.project_end_date && (
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
