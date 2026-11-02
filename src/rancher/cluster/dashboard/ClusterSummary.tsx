import { FC } from 'react';
import { RancherCluster } from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

export const ClusterSummary: FC<{
  resourceScope: RancherCluster;
  refetch: any;
}> = ({ resourceScope }) => {
  return (
    <div className="text-sm">
      <div className="xl:w-6/12 2xl:w-4/12">
        <PropertyList
          variant="summary"
          termWidth="md"
          space={1.5}
          hideIfEmpty={false}
        >
          <PropertyItem
            label={translate('Kubernetes version')}
            value={resourceScope?.kubernetes_version}
          />
          <PropertyItem
            label={translate('Load balancer IPs')}
            value={propVal.list(
              resourceScope?.public_ips?.map((item) =>
                item.external_ip_address
                  ? `${item.ip_address}/${item.external_ip_address}`
                  : item.ip_address,
              ),
            )}
            hasCopy
            hideIfEmpty
          />
          <PropertyItem
            label={translate('Router IPs')}
            value={propVal.list(resourceScope?.router_ips as string[])}
            hasCopy
            hideIfEmpty
          />
          <PropertyItem
            label={translate('Longhorn')}
            value={propVal.boolean(resourceScope?.install_longhorn, {
              display: 'badge',
            })}
          />
        </PropertyList>
      </div>
    </div>
  );
};
