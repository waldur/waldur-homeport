import { QueryFunction } from 'react-query';

import { fixURL, getFirst } from '@waldur/core/api';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { ResourcesSection } from '../ResourcesSection';
import { DataPage } from '../types';

export const VolumesSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const service_settings_uuid: string = (
      await getFirst('/service-settings/', {
        scope: resource.url,
      })
    )['uuid'];
    const response = await parseResponse(
      fixURL('/openstacktenant-volumes/'),
      {
        service_settings_uuid,
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name: instance.name,
        summary: translate('Size: {size}, attached to: {device}', {
          size: formatFilesize(instance.size),
          device: instance.device || 'N/A',
        }),
        state: instance.state,
        marketplace_resource_uuid: instance.marketplace_resource_uuid,
        project_uuid: instance.project_uuid,
      })),
      nextPage: response.nextPage,
    };
  };
  return (
    <ResourcesSection loadData={loadData} queryKey="volumes" canAdd={true} />
  );
};
