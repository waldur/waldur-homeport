import { QueryFunction } from 'react-query';

import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { getResourceState } from '@waldur/resource/state/utils';
import { parseResponse } from '@waldur/table/api';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const NetworksSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstack-networks/'),
      {
        tenant: resource.url,
        fields: ['name', 'subnets'],
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name: instance.name,
        summary: translate('Subnets: {subnets}', {
          subnets:
            instance.subnets
              .map((subnet) => `${subnet.name}: ${subnet.cidr}`)
              .join(', ') || 'N/A',
        }),
        url: instance.url,
        state: getResourceState(instance),
      })),
      nextPage: response.nextPage,
    };
  };
  return <ResourcesList loadData={loadData} queryKey="networks" />;
};
