import * as React from 'react';

import { translate } from '@waldur/i18n';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';

const countNodesByRole = (role, props) =>
  props.formData.attributes.nodes
    .map(node => node.roles.includes(role)).length;

const getTotal = (field, props) =>
  props.formData.attributes.nodes
    .map(node => node.flavor ? node.flavor[field] : undefined)
    .filter(value => value)
    .reduce((total, value) => total + value, 0);

const RancherExtraComponent = props => props.formData && props.formData.attributes ? (
  <>
    <tr>
      <td><strong>{translate('Total number of nodes')}</strong></td>
      <td>{props.formData.attributes.nodes.length}</td>
    </tr>
    <tr>
      <td><strong>{translate('Number of etcd nodes')}</strong></td>
      <td>{countNodesByRole('etcd', props)}</td>
    </tr>
    <tr>
      <td><strong>{translate('Number of worker nodes')}</strong></td>
      <td>{countNodesByRole('worker', props)}</td>
    </tr>
    <tr>
      <td><strong>{translate('Number of control plane nodes')}</strong></td>
      <td>{countNodesByRole('controlplane', props)}</td>
    </tr>
    <tr>
      <td><strong>{translate('Total CPU')}</strong></td>
      <td>{getTotal('cores', props)}</td>
    </tr>
    <tr>
      <td><strong>{translate('Total storage')}</strong></td>
      <td>{getTotal('disk', props)}</td>
    </tr>
    <tr>
      <td><strong>{translate('Total memory')}</strong></td>
      <td>{getTotal('ram', props)}</td>
    </tr>
  </>
) : null;

export const RancherClusterCheckoutSummary = props => (
  <OrderSummary
    {...props}
    extraComponent={RancherExtraComponent}
  />
);
