import { QueryFunction } from 'react-query';

import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { ResourcesSection } from '../ResourcesSection';
import { DataPage } from '../types';

export const FloatingIPsSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstack-floating-ips/'),
      {
        tenant: resource.url,
        fields: ['name', 'address'],
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name: instance.name,
        summary: translate('Address: {address}, instance: {instance}', {
          address: instance.address,
          instance: instance.instance_name || 'N/A',
        }),
        state: instance.state,
      })),
      nextPage: response.nextPage,
    };
  };
  return (
    <ResourcesSection
      loadData={loadData}
      queryKey="floating_ips"
      canAdd={true}
    />
  );
};
