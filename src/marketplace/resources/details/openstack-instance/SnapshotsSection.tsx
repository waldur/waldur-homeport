import { QueryFunction } from 'react-query';

import { fixURL } from '@waldur/core/api';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getResourceState } from '@waldur/resource/state/utils';
import { parseResponse } from '@waldur/table/api';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const SnapshotsSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstacktenant-backups/'),
      {
        instance: resource.url,
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((row) => ({
        name: row.name,
        summary: row.kept_until
          ? translate('Keep until {date}', {
              date: formatDateTime(row.kept_until),
            })
          : translate('Keep forever'),
        state: getResourceState(row),
        project_uuid: row.project_uuid,
      })),
      nextPage: response.nextPage,
    };
  };
  return <ResourcesList loadData={loadData} queryKey="backups" />;
};
