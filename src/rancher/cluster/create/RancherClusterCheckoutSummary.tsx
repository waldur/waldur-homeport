import { FunctionComponent } from 'react';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { CheckoutPricingRow } from '@/marketplace/deploy/CheckoutPricingRow';
import { OrderSummary } from '@/marketplace/details/OrderSummary';
import { NodeRole } from '@/rancher/types';

import { useFormNodes } from './utils';

const countNodesByRole = (role: NodeRole, nodes) =>
  nodes.filter((node) => (node.roles || []).includes(role)).length;

const sum = (values) => values.reduce((total, value) => total + value, 0);

const getTotalVolumesSize = (volumes) =>
  sum(volumes.map((volume) => volume.size));

const getTotalStorage = (nodes) =>
  sum(
    nodes.map(
      (node) =>
        node.system_volume_size + getTotalVolumesSize(node.data_volumes || []),
    ),
  );

const getFlavorField = (field, nodes) =>
  nodes.map((node) => (node.flavor ? node.flavor[field] : 0));

const getTotalCores = (nodes) => sum(getFlavorField('cores', nodes));

const getTotalRam = (nodes) => sum(getFlavorField('ram', nodes));

const RancherExtraComponent = () => {
  const nodes = useFormNodes();
  if (!nodes || nodes.length === 0) {
    return null;
  }
  const nodeCount = nodes.length;
  const agentCount = countNodesByRole('agent', nodes);
  const serverCount = countNodesByRole('server', nodes);
  const totalCores = getTotalCores(nodes);
  const totalStorage = formatFilesize(getTotalStorage(nodes) * 1024);
  const totalRam = formatFilesize(getTotalRam(nodes));

  return (
    <>
      <CheckoutPricingRow
        label={translate('Total number of nodes')}
        value={nodeCount}
      />

      <CheckoutPricingRow
        label={translate('Number of agent nodes')}
        value={agentCount}
      />

      <CheckoutPricingRow
        label={translate('Number of server nodes')}
        value={serverCount}
      />

      <CheckoutPricingRow label={translate('Total CPU')} value={totalCores} />

      <CheckoutPricingRow
        label={translate('Total storage')}
        value={totalStorage}
      />

      <CheckoutPricingRow label={translate('Total memory')} value={totalRam} />
    </>
  );
};

export const RancherClusterCheckoutSummary: FunctionComponent<any> = (
  props,
) => <OrderSummary {...props} extraComponent={RancherExtraComponent} />;
