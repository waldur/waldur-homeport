import React from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PropertyList,
  PropertyItem,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

interface ClusterResources {
  totalNodes: number;
  totalWorkerNodes: number;
  totalStorageNodes: number;
  totalControllerNodes: number;
  totalLoadBalancerNodes: number;
  totalVCpus: number;
  totalRam: number;
  totalSystemStorage: number;
  totalDataStorage: number;
  totalSanStorage: number;
}

interface K8sTotalResourcesCardProps {
  totalResources: ClusterResources;
  datacenterCount: number;
  controllerTooltip?: string;
  loadBalancerTooltip?: string;
}

export const K8sTotalResourcesCard: React.FC<K8sTotalResourcesCardProps> = ({
  totalResources,
  datacenterCount,
  controllerTooltip,
  loadBalancerTooltip,
}) => {
  return (
    <Card bordered size="sm" className="bg-secondary">
      <CardHeader>
        <CardTitle as="h6" className="text-sm text-secondary">
          {translate('Total cluster resources')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* One list of totals, laid out as chips: each row is a fixed-width
            column of label over value. */}
        <PropertyList
          variant="summary"
          labelClass="w-full sm:w-full"
          valueClass="w-full sm:w-full"
          className="flex flex-wrap gap-3 [&>*]:w-[110px] [&>*]:gap-y-2"
        >
          <PropertyItem
            label={translate('Controllers')}
            value={totalResources.totalControllerNodes}
            tooltip={controllerTooltip}
          />
          <PropertyItem
            label={translate('Load balancers')}
            value={totalResources.totalLoadBalancerNodes}
            tooltip={loadBalancerTooltip}
          />
          <PropertyItem
            label={translate('Total nodes')}
            value={totalResources.totalNodes}
          />
          <PropertyItem
            label={translate('Total vCPUs')}
            value={propVal.number(totalResources.totalVCpus, { unit: 'cores' })}
          />
          <PropertyItem
            label={translate('Total RAM')}
            value={propVal.number(totalResources.totalRam, { unit: 'GB' })}
          />
          <PropertyItem
            label={translate('System + etcd')}
            value={propVal.number(totalResources.totalSystemStorage, {
              unit: 'GB',
            })}
          />
          <PropertyItem
            label={translate('Workers')}
            value={totalResources.totalWorkerNodes}
          />
          <PropertyItem
            label={translate('Storage')}
            value={totalResources.totalStorageNodes}
          />
          <PropertyItem
            label={translate('Data + logs')}
            value={propVal.number(totalResources.totalDataStorage, {
              unit: 'GB',
            })}
          />
          <PropertyItem
            label={translate('SAN storage')}
            value={propVal.number(totalResources.totalSanStorage, {
              unit: 'GB',
            })}
          />
          <PropertyItem
            label={translate('Datacenters')}
            value={propVal.number(datacenterCount)}
          />
        </PropertyList>
      </CardContent>
    </Card>
  );
};
