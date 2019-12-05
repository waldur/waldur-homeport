import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';

const countNodesByRole = (role, nodes) =>
  nodes.map(node => node.roles.includes(role)).length;

const getTotal = (field, nodes) =>
  nodes
    .map(node => node.flavor ? node.flavor[field] : undefined)
    .filter(value => value)
    .reduce((total, value) => total + value, 0);

const getStats = state => {
  const formData: any = getFormValues(FORM_ID)(state);
  if (!formData || !formData.attributes) {
    return;
  }
  const nodes = formData.attributes.nodes;
  const nodeCount = nodes.length;
  const etcdCount = countNodesByRole('etcd', nodes);
  const workerCount = countNodesByRole('worker', nodes);
  const controlCount = countNodesByRole('controlplane', nodes);
  const totalCores = getTotal('cores', nodes);
  const totalStorage = formatFilesize(getTotal('disk', nodes));
  const totalRam = formatFilesize(getTotal('ram', nodes));
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

const PureRancherExtraComponent = props => props.nodeCount ? (
  <>
    <tr>
      <td><strong>{translate('Total number of nodes')}</strong></td>
      <td>{props.nodeCount}</td>
    </tr>
    <tr>
      <td><strong>{translate('Number of etcd nodes')}</strong></td>
      <td>{props.etcdCount}</td>
    </tr>
    <tr>
      <td><strong>{translate('Number of worker nodes')}</strong></td>
      <td>{props.workerCount}</td>
    </tr>
    <tr>
      <td><strong>{translate('Number of control plane nodes')}</strong></td>
      <td>{props.controlCount}</td>
    </tr>
    <tr>
      <td><strong>{translate('Total CPU')}</strong></td>
      <td>{props.totalCores}</td>
    </tr>
    <tr>
      <td><strong>{translate('Total storage')}</strong></td>
      <td>{props.totalStorage}</td>
    </tr>
    <tr>
      <td><strong>{translate('Total memory')}</strong></td>
      <td>{props.totalRam}</td>
    </tr>
  </>
) : null;

const RancherExtraComponent = connector(PureRancherExtraComponent);

export const RancherClusterCheckoutSummary = props => (
  <OrderSummary
    {...props}
    extraComponent={RancherExtraComponent}
  />
);
