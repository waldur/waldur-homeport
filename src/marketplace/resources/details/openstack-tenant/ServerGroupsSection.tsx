import { QueryFunction } from 'react-query';

import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const ServerGroupsSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstack-server-groups/'),
      {
        tenant: resource.url,
        fields: ['name', 'policy'],
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name: instance.name,
        summary: translate('Policy: {policy}', instance),
        url: instance.url,
      })),
      nextPage: response.nextPage,
    };
  };
  return <ResourcesList loadData={loadData} queryKey="server_groups" />;
};
