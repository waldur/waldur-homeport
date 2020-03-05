import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';

const countNodesByRole = (role, nodes) =>
  nodes.filter(node => (node.roles || []).includes(role)).length;

const sum = values => values.reduce((total, value) => total + value, 0);

const getTotalVolumesSize = volumes => sum(volumes.map(volume => volume.size));

const getTotalStorage = nodes =>
  sum(
    nodes.map(
      node =>
        node.system_volume_size + getTotalVolumesSize(node.data_volumes || []),
    ),
  );

const getFlavorField = (field, nodes) =>
  nodes.map(node => (node.flavor ? node.flavor[field] : 0));

const getTotalCores = nodes => sum(getFlavorField('cores', nodes));

const getTotalRam = nodes => sum(getFlavorField('ram', nodes));

const getStats = state => {
  const formData: any = getFormValues(FORM_ID)(state);
  if (!formData || !formData.attributes) {
    return {};
  }
  const nodes = formData.attributes.nodes;
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

const PureRancherExtraComponent = props =>
  props.nodeCount ? (
    <>
      <tr>
        <td>
          <strong>{translate('Total number of nodes')}</strong>
        </td>
        <td>{props.nodeCount}</td>
      </tr>
      <tr>
        <td>
          <strong>{translate('Number of etcd nodes')}</strong>
        </td>
        <td>{props.etcdCount}</td>
      </tr>
      <tr>
        <td>
          <strong>{translate('Number of worker nodes')}</strong>
        </td>
        <td>{props.workerCount}</td>
      </tr>
      <tr>
        <td>
          <strong>{translate('Number of control plane nodes')}</strong>
        </td>
        <td>{props.controlCount}</td>
      </tr>
      <tr>
        <td>
          <strong>{translate('Total CPU')}</strong>
        </td>
        <td>{props.totalCores}</td>
      </tr>
      <tr>
        <td>
          <strong>{translate('Total storage')}</strong>
        </td>
        <td>{props.totalStorage}</td>
      </tr>
      <tr>
        <td>
          <strong>{translate('Total memory')}</strong>
        </td>
        <td>{props.totalRam}</td>
      </tr>
    </>
  ) : null;

const RancherExtraComponent = connector(PureRancherExtraComponent);

export const RancherClusterCheckoutSummary = props => (
  <OrderSummary {...props} extraComponent={RancherExtraComponent} />
);
