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

const ISSUE_DESCRIPTIONS = {
  INCIDENT: gettext('Incident - client issue with service usage or availability (interruptions, degradation of quality).'),
  SERVICE_REQUEST: gettext('Service Request - client’s request to modify, add, change or remove partially or completely a particular service.'),
  INFORMATIONAL: gettext('Informational - client’s request to get or provide additional information related to a service.'),
  CHANGE_REQUEST: '',
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
    description: ISSUE_DESCRIPTIONS[item],
    id: ISSUE_IDS[item],
  };
});

