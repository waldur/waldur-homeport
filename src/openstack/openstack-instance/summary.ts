import { lazyComponent } from '@/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@/resource/summary/types';

import { INSTANCE_TYPE } from '../constants';

const OpenStackInstanceSummary = lazyComponent(() =>
  import('./OpenStackInstanceSummary').then((module) => ({
    default: module.OpenStackInstanceSummary,
  })),
);

export const OpenStackInstanceSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: INSTANCE_TYPE,
    component: OpenStackInstanceSummary,
  };
