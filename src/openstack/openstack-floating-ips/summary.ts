import { lazyComponent } from '@/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@/resource/summary/types';

const OpenStackFloatingIpSummary = lazyComponent(() =>
  import('./OpenStackFloatingIpSummary').then((module) => ({
    default: module.OpenStackFloatingIpSummary,
  })),
);

export const OpenStackFloatingIpSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.FloatingIP',
    component: OpenStackFloatingIpSummary,
  };
