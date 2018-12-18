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
};

export const DEFAULT_RESOURCE_TABS = {
  order: [
    'issues',
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
