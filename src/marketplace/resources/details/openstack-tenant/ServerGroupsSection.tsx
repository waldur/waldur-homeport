import { QueryFunction } from 'react-query';

import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { ResourcesSection } from '../ResourcesSection';
import { DataPage } from '../types';

export const ServerGroupsSection = ({ resource, count }) => {
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
      })),
      nextPage: response.nextPage,
    };
  };
  return (
    <ResourcesSection
      title={translate('Server groups')}
      loadData={loadData}
      count={count}
      queryKey="server_groups"
    />
  );
};
