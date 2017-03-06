export const ISSUE_IDS = {
  INCIDENT: 'Incident',
  CHANGE_REQUEST: 'Change Request',
  SERVICE_REQUEST: 'Service Request',
  INFORMATIONAL: 'Informational'
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
  SERVICE_REQUEST: 'fa-plus-square',
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
    label: 'Organization name'
  },
  {
    name: 'customer',
    label: 'Organization code'
  },
  {
    name: 'project',
    label: 'Project name'
  },
  {
    name: 'scope',
    label: 'Service type'
  },
  {
    name: 'resource',
    label: 'Affected resource'
  },
  {
    name: 'type',
    label: 'Request type'
  },
  {
    name: 'status',
    label: 'Status'
  },
  {
    name: 'reporter',
    label: 'Reporter'
  },
  {
    name: 'assignee',
    label: 'Assignee'
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
      label: 'Organization'
    },
    project: {
      label: 'Project'
    },
    caller: {
      label: 'Caller'
    },
    key: {
      label: 'Key'
    },
    type: {
      label: 'Request type'
    },
    status: {
      label: 'Status'
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
