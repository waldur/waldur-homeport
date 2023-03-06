import { QueryFunction } from 'react-query';

import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { formatCrontab } from '@waldur/resource/crontab';
import { getResourceState } from '@waldur/resource/state/utils';
import { parseResponse } from '@waldur/table/api';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const SnapshotSchedulesSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstacktenant-snapshot-schedules/'),
      {
        source_volume: resource.url,
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((row) => ({
        name: row.name,
        summary: translate('Schedule {schedule}', {
          schedule: formatCrontab(row.schedule),
        }),
        state: getResourceState(row),
      })),
      nextPage: response.nextPage,
    };
  };
  return <ResourcesList loadData={loadData} queryKey="snapshot_schedules" />;
};
