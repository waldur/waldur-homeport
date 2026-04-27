import { lazyComponent } from '@/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@/resource/summary/types';

const OpenStackNetworkSummary = lazyComponent(() =>
  import('./OpenStackNetworkSummary').then((module) => ({
    default: module.OpenStackNetworkSummary,
  })),
);

export const OpenStackNetworkSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.Network',
    component: OpenStackNetworkSummary,
  };
