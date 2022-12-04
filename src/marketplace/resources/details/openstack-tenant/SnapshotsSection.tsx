import { QueryFunction } from 'react-query';

import { fixURL, getFirst } from '@waldur/core/api';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const SnapshotsSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const service_settings_uuid: string = (
      await getFirst('/service-settings/', {
        scope: resource.url,
      })
    )['uuid'];
    const response = await parseResponse(
      fixURL('/openstacktenant-snapshots/'),
      {
        service_settings_uuid,
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name: instance.name,
        summary: translate('Size: {size}', {
          size: formatFilesize(instance.size),
        }),
        state: instance.state,
        url: instance.url,
      })),
      nextPage: response.nextPage,
    };
  };
  return <ResourcesList loadData={loadData} queryKey="snapshots" />;
};
