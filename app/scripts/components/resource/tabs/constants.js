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
      heading: 'Audit log',
      component: 'resourceEvents',
    },
    issues: {
      heading: 'Issues',
      component: 'resourceIssues',
    },
    alerts: {
      heading: 'Alerts',
      component: 'resourceAlerts',
      feature: 'alerts',
    },
    graphs: {
      heading: 'Graphs',
      component: 'resourceGraphs',
      feature: 'monitoring',
    },
    sla: {
      heading: 'SLA',
      component: 'resourceSla',
      feature: 'monitoring',
    },
  }
};
