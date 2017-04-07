export const DEFAULT_RESOURCE_TABS = {
  order: [
    'events',
    'issues',
    'alerts',
    'graphs',
    'sla',
  ],
  options: {
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
  }
};
