import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import { VOLUME_TYPE } from '../constants';

import './marketplace';
import './tabs';
const OpenStackVolumeSummary = lazyComponent(
  () => import('./OpenStackVolumeSummary'),
  'OpenStackVolumeSummary',
);

ResourceSummary.register(VOLUME_TYPE, OpenStackVolumeSummary);
