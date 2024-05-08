import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import { INSTANCE_TYPE } from '../constants';

import './marketplace';
import './tabs';

const OpenStackInstanceSummary = lazyComponent(
  () => import('./OpenStackInstanceSummary'),
  'OpenStackInstanceSummary',
);

ResourceSummary.register(INSTANCE_TYPE, OpenStackInstanceSummary);
