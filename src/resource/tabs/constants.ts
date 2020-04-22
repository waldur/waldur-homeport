import { translate } from '@waldur/i18n';
import { ResourceOrderItemsTab } from '@waldur/marketplace/orders/item/list/ResourceOrderItems';

import { ResourceEvents } from './ResourceEvents';
import { ResourceIssuesList } from './ResourceIssuesList';
import { ResourceTab } from './types';

export const getEventsTab = (): ResourceTab => ({
  key: 'events',
  title: translate('Audit log'),
  component: ResourceEvents,
});

const getIssuesTab = (): ResourceTab => ({
  key: 'issues',
  title: translate('Issues'),
  component: ResourceIssuesList,
  feature: 'support',
});

const getOrderItemsTab = (): ResourceTab => ({
  key: 'orderItems',
  title: translate('Order items'),
  component: ResourceOrderItemsTab,
  feature: 'marketplace',
  isVisible: resource => Boolean(resource.marketplace_resource_uuid),
});

export const getDefaultResourceTabs = (): ResourceTab[] => [
  getEventsTab(),
  getIssuesTab(),
  getOrderItemsTab(),
];
