import React from 'react';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

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

const TotalClusterResourceItem = ({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: React.ReactNode;
  tooltip?: string;
}) => (
  <Field
    label={label}
    value={value}
    tooltip={tooltip}
    labelCol={12}
    className="gap-y-2 w-[110px]"
  />
);

export const K8sTotalResourcesCard: React.FC<K8sTotalResourcesCardProps> = ({
  totalResources,
  datacenterCount,
  controllerTooltip,
  loadBalancerTooltip,
}) => {
  return (
    <div className="card card-bordered card-sm bg-secondary">
      <div className="card-header">
        <h6 className="card-title text-sm text-secondary">
          {translate('Total cluster resources')}
        </h6>
      </div>
      <div className="card-body">
        <div className="flex flex-wrap gap-3">
          <TotalClusterResourceItem
            label={translate('Controllers')}
            value={totalResources.totalControllerNodes}
            tooltip={controllerTooltip}
          />
          <TotalClusterResourceItem
            label={translate('Load balancers')}
            value={totalResources.totalLoadBalancerNodes}
            tooltip={loadBalancerTooltip}
          />
          <TotalClusterResourceItem
            label={translate('Total nodes')}
            value={totalResources.totalNodes}
          />
          <TotalClusterResourceItem
            label={translate('Total vCPUs')}
            value={totalResources.totalVCpus + ' cores'}
          />
          <TotalClusterResourceItem
            label={translate('Total RAM')}
            value={totalResources.totalRam + ' GB'}
          />
          <TotalClusterResourceItem
            label={translate('System + etcd')}
            value={totalResources.totalSystemStorage + ' GB'}
          />
          <TotalClusterResourceItem
            label={translate('Workers')}
            value={totalResources.totalWorkerNodes}
          />
          <TotalClusterResourceItem
            label={translate('Storage')}
            value={totalResources.totalStorageNodes}
          />
          <TotalClusterResourceItem
            label={translate('Data + logs')}
            value={totalResources.totalDataStorage + ' GB'}
          />
          <TotalClusterResourceItem
            label={translate('SAN storage')}
            value={totalResources.totalSanStorage + ' GB'}
          />
          <TotalClusterResourceItem
            label={translate('Datacenters')}
            value={datacenterCount}
          />
        </div>
      </div>
    </div>
  );
};
