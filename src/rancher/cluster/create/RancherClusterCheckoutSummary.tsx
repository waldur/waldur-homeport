import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { CheckoutPricingRow } from '@waldur/marketplace/deploy/CheckoutPricingRow';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';
import { NodeRole } from '@waldur/rancher/types';
import { type RootState } from '@waldur/store/reducers';

import { formNodesSelector } from './utils';

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

const getStats = (state: RootState) => {
  const nodes = formNodesSelector(state);
  if (!nodes) {
    return {};
  }
  const nodeCount = nodes.length;
  const agentCount = countNodesByRole('agent', nodes);
  const serverCount = countNodesByRole('server', nodes);
  const totalCores = getTotalCores(nodes);
  const totalStorage = formatFilesize(getTotalStorage(nodes) * 1024);
  const totalRam = formatFilesize(getTotalRam(nodes));
  return {
    nodeCount,
    agentCount,
    serverCount,
    totalCores,
    totalStorage,
    totalRam,
  };
};

const connector = connect(getStats);

const PureRancherExtraComponent = (props: ReturnType<typeof getStats>) =>
  props.nodeCount ? (
    <>
      <CheckoutPricingRow
        label={translate('Total number of nodes')}
        value={props.nodeCount}
      />

      <CheckoutPricingRow
        label={translate('Number of agent nodes')}
        value={props.agentCount}
      />

      <CheckoutPricingRow
        label={translate('Number of server nodes')}
        value={props.serverCount}
      />

      <CheckoutPricingRow
        label={translate('Total CPU')}
        value={props.totalCores}
      />

      <CheckoutPricingRow
        label={translate('Total storage')}
        value={props.totalStorage}
      />

      <CheckoutPricingRow
        label={translate('Total memory')}
        value={props.totalRam}
      />
    </>
  ) : null;

const RancherExtraComponent = connector(PureRancherExtraComponent);

export const RancherClusterCheckoutSummary: FunctionComponent<any> = (
  props,
) => <OrderSummary {...props} extraComponent={RancherExtraComponent} />;
