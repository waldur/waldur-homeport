import { lazyComponent } from '@/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@/resource/summary/types';

import { VOLUME_TYPE } from '../constants';
const OpenStackVolumeSummary = lazyComponent(() =>
  import('./OpenStackVolumeSummary').then((module) => ({
    default: module.OpenStackVolumeSummary,
  })),
);

export const OpenStackVolumeSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: VOLUME_TYPE,
    component: OpenStackVolumeSummary,
  };
