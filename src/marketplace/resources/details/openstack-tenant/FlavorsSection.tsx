import { QueryFunction } from '@tanstack/react-query';

import { fixURL } from '@waldur/core/api';
import { formatFlavor } from '@waldur/resource/utils';
import { parseResponse } from '@waldur/table/api';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const FlavorsSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstack-flavors/'),
      {
        settings: resource.service_settings,
        fields: ['name', 'cores', 'ram', 'storage'],
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name: instance.name,
        summary: formatFlavor(instance),
      })),
      nextPage: response.nextPage,
    };
  };
  return <ResourcesList loadData={loadData} queryKey="flavors" />;
};
