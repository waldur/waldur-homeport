import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';
import './breadcrumbs';
import { OpenStackSubNetSummary } from './OpenStackSubNetSummary';
import './tabs';

export default () => {
  ResourceSummary.register('OpenStack.SubNet', OpenStackSubNetSummary);
};
