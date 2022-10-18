import { QueryFunction } from 'react-query';

import { fixURL, getFirst } from '@waldur/core/api';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { ResourcesSection } from '../ResourcesSection';
import { DataPage } from '../types';

export const SnapshotsSection = ({ resource, count }) => {
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
      })),
      nextPage: response.nextPage,
    };
  };
  return (
    <ResourcesSection
      title={translate('Snapshots')}
      loadData={loadData}
      count={count}
      queryKey="snapshots"
    />
  );
};