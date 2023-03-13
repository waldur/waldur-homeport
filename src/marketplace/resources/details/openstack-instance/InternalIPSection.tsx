import { QueryFunction } from '@tanstack/react-query';

import { translate } from '@waldur/i18n';
import { formatAddressList } from '@waldur/openstack/openstack-instance/utils';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const InternalIPSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = () => ({
    data: resource.internal_ips_set.map((ip) => ({
      name: formatAddressList(ip),
      summary: translate(
        'MAC address: {mac_address}, subnet name: {subnet_name}',
        ip,
      ),
    })),
    nextPage: null,
  });
  return <ResourcesList loadData={loadData} queryKey="internal_ips" />;
};
