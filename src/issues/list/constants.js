export const ISSUE_FILTERS = [
  {
    name: 'customer',
    label: gettext('Organization name')
  },
  {
    name: 'customer',
    label: gettext('Organization code')
  },
  {
    name: 'project',
    label: gettext('Project name')
  },
  {
    name: 'scope',
    label: gettext('Service type')
  },
  {
    name: 'resource',
    label: gettext('Affected resource')
  },
  {
    name: 'type',
    label: gettext('Request type')
  },
  {
    name: 'status',
    label: gettext('Status')
  },
  {
    name: 'reporter',
    label: gettext('Reporter')
  },
  {
    name: 'assignee',
    label: gettext('Assignee')
  }
];

export const ISSUE_FILTERS_SHORT = {
  order: [
    'customer',
    'project',
    'caller',
    'key',
    'type',
    'status'
  ],
  options: {
    customer: {
      label: gettext('Organization')
    },
    project: {
      label: gettext('Project')
    },
    caller: {
      label: gettext('Caller')
    },
    key: {
      label: gettext('Key')
    },
    type: {
      label: gettext('Request type')
    },
    status: {
      label: gettext('Status')
    }
  }
};

const mapStringsToChoices = choices => choices.map(item => ({
  label: item,
  value: item
}));

export const CHANNELS = [
  'phone',
  'email',
  'self-service',
  'monitoring'
];

export const CHANNEL_CHOICES = mapStringsToChoices(CHANNELS);
