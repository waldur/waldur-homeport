import { translate } from '@waldur/i18n';

export const getDefaultItems = project => [
  {
    key: 'dashboard',
    icon: 'fa-th-large',
    label: translate('Dashboard'),
    state: 'project.details',
    params: {
      uuid: project.uuid,
    },
    index: 100,
  },
  {
    key: 'eventlog',
    state: 'project.events',
    params: {
      uuid: project.uuid,
    },
    icon: 'fa-bell-o',
    label: translate('Audit logs'),
    feature: 'eventlog',
    index: 500,
  },
  {
    key: 'support',
    state: 'project.issues',
    params: {
      uuid: project.uuid,
    },
    icon: 'fa-question-circle',
    label: translate('Issues'),
    feature: 'support',
    index: 600,
  },
  {
    label: translate('Team'),
    icon: 'fa-group',
    state: 'project.team',
    params: {
      uuid: project.uuid,
    },
    feature: 'team',
    key: 'team',
    countFieldKey: 'users',
    index: 800,
  },
];

export const getBackToOrganization = customerUuid => ({
  label: translate('Back to organization'),
  icon: 'fa-arrow-left',
  state: 'organization.dashboard',
  params: { uuid: customerUuid },
});
