import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';
import './tabs';

const OpenStackSecurityGroupSummary = lazyComponent(
  () => import('./OpenStackSecurityGroupSummary'),
  'OpenStackSecurityGroupSummary',
);

ResourceSummary.register(
  'OpenStack.SecurityGroup',
  OpenStackSecurityGroupSummary,
);
