import { QueryFunction } from '@tanstack/react-query';

import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const PortsSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstack-ports/'),
      {
        tenant: resource.url,
        fields: ['name', 'fixed_ips', 'mac_address'],
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name:
          instance.fixed_ips.map((fip) => fip.ip_address).join(', ') || 'N/A',
        summary: translate('MAC address: {mac_address}', {
          mac_address: instance.mac_address || 'N/A',
        }),
        url: instance.url,
      })),
      nextPage: response.nextPage,
    };
  };
  return <ResourcesList loadData={loadData} queryKey="ports" />;
};
