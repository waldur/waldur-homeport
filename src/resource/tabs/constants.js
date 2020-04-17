import { translate } from '@waldur/i18n';
import { ResourceOrderItemsTab } from '@waldur/marketplace/orders/item/list/ResourceOrderItems';

import { ResourceEvents } from './ResourceEvents';
import { ResourceIssuesList } from './ResourceIssuesList';

export const getEventsTab = () => ({
  key: 'events',
  title: translate('Audit log'),
  component: ResourceEvents,
});

const getIssuesTab = () => ({
  key: 'issues',
  title: translate('Issues'),
  component: ResourceIssuesList,
  feature: 'support',
});

const getOrderItemsTab = () => ({
  key: 'orderItems',
  title: translate('Order items'),
  component: ResourceOrderItemsTab,
  feature: 'marketplace',
  isVisible: resource => Boolean(resource.marketplace_resource_uuid),
});

export const getDefaultResourceTabs = () => [
  getEventsTab(),
  getIssuesTab(),
  getOrderItemsTab(),
];
