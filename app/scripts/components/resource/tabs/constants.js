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
  alerts: {
    heading: gettext('Alerts'),
    component: 'resourceAlerts',
    feature: 'alerts',
  },
  graphs: {
    heading: gettext('Graphs'),
    component: 'resourceGraphs',
    feature: 'monitoring',
  },
  sla: {
    heading: gettext('SLA'),
    component: 'resourceSla',
    feature: 'monitoring',
  },
};

export const DEFAULT_RESOURCE_TABS = {
  order: [
    'events',
    'issues',
    'alerts',
  ],
  options: TABS
};

export const DEFAULT_SUBRESOURCE_TABS = {
  order: [
    'events',
    'alerts',
  ],
  options: TABS
};
