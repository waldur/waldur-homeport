const TABS = {
  events: {
    heading: gettext('Audit log'),
    component: 'resourceEvents',
  },
  issues: {
    heading: gettext('Issues'),
    component: 'resourceIssues',
    feature: 'support',
  },
  orderItems: {
    heading: gettext('Order items'),
    component: 'marketplaceResourceOrderItems',
    feature: 'marketplace',
    isVisible: resource => Boolean(resource.marketplace_resource_uuid),
  },
};

export const DEFAULT_RESOURCE_TABS = {
  order: [
    'issues',
    'orderItems',
    'events',
  ],
  options: TABS
};

export const DEFAULT_SUBRESOURCE_TABS = {
  order: [
    'events',
  ],
  options: TABS
};
