import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';

import type { ResourceTab } from './types';

const ResourceOrderItemsTab = lazyComponent(
  () => import('@waldur/marketplace/orders/item/list/ResourceOrderItems'),
  'ResourceOrderItemsTab',
);
const ResourceEvents = lazyComponent(
  () => import('./ResourceEvents'),
  'ResourceEvents',
);
const ResourceIssuesList = lazyComponent(
  () => import('./ResourceIssuesList'),
  'ResourceIssuesList',
);

export const getEventsTab = (): ResourceTab => ({
  key: 'events',
  title: translate('Audit log'),
  component: ResourceEvents,
});

const getIssuesTab = (): ResourceTab => ({
  key: 'issues',
  title: translate('Issues'),
  component: ResourceIssuesList,
});

const getOrderItemsTab = (): ResourceTab => ({
  key: 'orderItems',
  title: translate('Order items'),
  component: ResourceOrderItemsTab,
  isVisible: (resource) => Boolean(resource.marketplace_resource_uuid),
});

export const getDefaultResourceTabs = (): ResourceTab[] => [
  getEventsTab(),
  ENV.plugins.WALDUR_SUPPORT && getIssuesTab(),
  getOrderItemsTab(),
];
