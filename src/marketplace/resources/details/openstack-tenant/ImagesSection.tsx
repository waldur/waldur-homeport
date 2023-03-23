import { QueryFunction } from '@tanstack/react-query';

import { fixURL } from '@waldur/core/api';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const ImagesSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstack-images/'),
      {
        settings: resource.service_settings,
        fields: ['name'],
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name: instance.name,
        summary: translate('Minimal RAM: {min_ram}, Minimal disk: {min_disk}', {
          min_ram: formatFilesize(instance.min_ram),
          min_disk: formatFilesize(instance.min_disk),
        }),
      })),
      nextPage: response.nextPage,
    };
  };
  return <ResourcesList loadData={loadData} queryKey="images" />;
};
