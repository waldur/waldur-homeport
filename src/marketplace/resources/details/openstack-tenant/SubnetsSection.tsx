import { QueryFunction } from 'react-query';

import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { ResourcesSection } from '../ResourcesSection';
import { DataPage } from '../types';

export const SubnetsSection = ({ resource, count }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstack-subnets/'),
      {
        tenant: resource.url,
        fields: ['name', 'cidr', 'network'],
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name: instance.name,
        summary: translate('Network: {network_name}, CIDR: {cidr}', instance),
        state: instance.state,
      })),
      nextPage: response.nextPage,
    };
  };
  return (
    <ResourcesSection
      title={translate('Subnets')}
      loadData={loadData}
      count={count}
      queryKey="subnets"
    />
  );
};
