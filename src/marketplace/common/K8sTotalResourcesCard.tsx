import React from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

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
    className="gy-8px w-110px"
  />
);

export const K8sTotalResourcesCard: React.FC<K8sTotalResourcesCardProps> = ({
  totalResources,
  datacenterCount,
  controllerTooltip,
  loadBalancerTooltip,
}) => {
  return (
    <Card className="card-bordered card-sm bg-gray-50">
      <Card.Header>
        <Card.Title as="h6" className="fs-6 text-secondary">
          {translate('Total cluster resources')}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="d-flex flex-wrap gap-4">
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
      </Card.Body>
    </Card>
  );
};
