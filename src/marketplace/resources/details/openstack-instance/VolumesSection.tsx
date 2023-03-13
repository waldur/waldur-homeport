import { QueryFunction } from '@tanstack/react-query';

import { fixURL } from '@waldur/core/api';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getResourceState } from '@waldur/resource/state/utils';
import { parseResponse } from '@waldur/table/api';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const VolumesSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstacktenant-volumes/'),
      {
        instance: resource.url,
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((volume) => ({
        name: volume.name,
        summary: translate('Size: {size}, attached to: {device}', {
          size: formatFilesize(volume.size),
          device: volume.device || 'N/A',
        }),
        state: getResourceState(volume),
        marketplace_resource_uuid: volume.marketplace_resource_uuid,
        project_uuid: volume.project_uuid,
        url: volume.url,
      })),
      nextPage: response.nextPage,
    };
  };
  return <ResourcesList loadData={loadData} queryKey="volumes" />;
};
