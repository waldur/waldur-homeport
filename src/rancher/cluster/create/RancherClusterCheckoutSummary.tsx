import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { CheckoutPricingRow } from '@waldur/marketplace/deploy/CheckoutPricingRow';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';
import { orderFormAttributesSelector } from '@waldur/marketplace/utils';
import { NodeRole } from '@waldur/rancher/types';
import { RootState } from '@waldur/store/reducers';

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
  const attributes: any = orderFormAttributesSelector(state);
  if (!attributes) {
    return {};
  }
  const nodes = attributes.nodes;
  const nodeCount = nodes.length;
  const etcdCount = countNodesByRole('etcd', nodes);
  const workerCount = countNodesByRole('worker', nodes);
  const controlCount = countNodesByRole('controlplane', nodes);
  const totalCores = getTotalCores(nodes);
  const totalStorage = formatFilesize(getTotalStorage(nodes) * 1024);
  const totalRam = formatFilesize(getTotalRam(nodes));
  return {
    nodeCount,
    etcdCount,
    workerCount,
    controlCount,
    totalCores,
    totalStorage,
    totalRam,
  };
};

const connector = connect(getStats);

const PureRancherExtraComponent = (props) =>
  props.nodeCount ? (
    <>
      <CheckoutPricingRow
        label={translate('Total number of nodes')}
        value={props.nodeCount}
      />
      <CheckoutPricingRow
        label={translate('Number of etcd nodes')}
        value={props.etcdCount}
      />
      <CheckoutPricingRow
        label={translate('Number of worker nodes')}
        value={props.workerCount}
      />
      <CheckoutPricingRow
        label={translate('Number of control plane nodes')}
        value={props.controlCount}
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
