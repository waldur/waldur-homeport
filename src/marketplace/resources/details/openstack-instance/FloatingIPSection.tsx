import { QueryFunction } from 'react-query';

import { translate } from '@waldur/i18n';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const FloatingIPSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = () => ({
    data: resource.floating_ips.map((ip) => ({
      name: ip.address,
      summary: translate(
        'MAC address: {internal_ip_mac_address}, subnet name: {subnet_name}',
        ip,
      ),
    })),
    nextPage: null,
  });
  return <ResourcesList loadData={loadData} queryKey="floating_ips" />;
};
