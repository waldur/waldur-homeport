export const ISSUE_TYPES = [
  'Incident',
  'Change request',
  'Service request',
  'Informational'
];

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
  'Resolved', 'Unresolved', "Won't fix"
];
