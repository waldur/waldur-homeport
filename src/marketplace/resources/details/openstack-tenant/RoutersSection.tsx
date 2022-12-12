import { QueryFunction } from 'react-query';

import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { getResourceState } from '@waldur/resource/state/utils';
import { parseResponse } from '@waldur/table/api';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const RoutersSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstack-routers/'),
      {
        tenant: resource.url,
        fields: ['name', 'fixed_ips'],
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name: instance.name,
        summary: translate('Fixed IPs: {fixed_ips}', {
          fixed_ips: instance.fixed_ips.join(', '),
        }),
        state: getResourceState(instance),
      })),
      nextPage: response.nextPage,
    };
  };
  return <ResourcesList loadData={loadData} queryKey="routers" />;
};
