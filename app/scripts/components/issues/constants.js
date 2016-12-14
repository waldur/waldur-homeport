export const ISSUE_TYPES = [
  'Incident',
  'Change request',
  'Service request',
  'Informational'
];

export const ISSUE_IDS = {
  'Incident': 'Incident',
  'Change request': 'Change request',
  'Service request': 'Service request',
  'Informational': 'Informational'
};

export const ISSUE_CLASSES = {
  'Incident': 'label-danger',
  'Informational': 'label-warning',
  'Change request': 'label-success',
  'Service request': 'label-info'
};

export const ISSUE_ICONS = {
  'Incident': 'fa-exclamation-triangle',
  'Change request': 'fa-check-square',
  'Service request': 'fa-plus-square',
  'Informational': 'fa-question-circle'
};

export const ISSUE_TEXT_CLASSES = {
  'Incident': 'text-danger',
  'Informational': 'text-warning',
  'Change request': 'text-success',
  'Service request': 'text-info'
};

export const ISSUE_STATUSES = [
  'Resolved',
  'Unresolved',
  'Won\'t fix'
];

export const ISSUE_TYPE_CHOICES = ISSUE_TYPES.map(item => {
  return {
    iconClass: ISSUE_ICONS[item],
    textClass: ISSUE_TEXT_CLASSES[item],
    label: item,
    id: ISSUE_IDS[item]
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
    label: 'Scope'
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
}

const mapStringsToChoices = choices => choices.map(item => ({
  label: item,
  value: item
}));

export const ISSUE_STATUS_CHOICES = mapStringsToChoices(ISSUE_STATUSES);

export const CHANNELS = [
  'phone',
  'email',
  'self-service',
  'monitoring'
];

export const CHANNEL_CHOICES = mapStringsToChoices(CHANNELS);
