import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';
import './breadcrumbs';
import './tabs';
import { OpenStackNetworkSummary } from './OpenStackNetworkSummary';

export default () => {
  ResourceSummary.register('OpenStack.Network', OpenStackNetworkSummary);
};
