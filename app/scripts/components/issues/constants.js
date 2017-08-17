export const ISSUE_IDS = {
  INCIDENT: gettext('Incident'),
  CHANGE_REQUEST: gettext('Change Request'),
  SERVICE_REQUEST: gettext('Service Request'),
  INFORMATIONAL: gettext('Informational'),
};

export const ISSUE_CLASSES = {
  INCIDENT: 'label-danger',
  INFORMATIONAL: 'label-warning',
  CHANGE_REQUEST: 'label-success',
  SERVICE_REQUEST: 'label-info'
};

export const ISSUE_ICONS = {
  INCIDENT: 'fa-exclamation-triangle',
  CHANGE_REQUEST: 'fa-check-square',
  SERVICE_REQUEST: 'fa-puzzle-piece',
  INFORMATIONAL: 'fa-question-circle'
};

export const ISSUE_TEXT_CLASSES = {
  INCIDENT: 'text-danger',
  INFORMATIONAL: 'text-warning',
  CHANGE_REQUEST: 'text-success',
  SERVICE_REQUEST: 'text-info'
};

export const ISSUE_STATUSES = [
  'Resolved',
  'Unresolved',
  'Won\'t fix'
];

export const ISSUE_TYPE_CHOICES = Object.keys(ISSUE_IDS).map(item => {
  return {
    iconClass: ISSUE_ICONS[item],
    textClass: ISSUE_TEXT_CLASSES[item],
    label: ISSUE_IDS[item],
    id: ISSUE_IDS[item],
  };
});

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
