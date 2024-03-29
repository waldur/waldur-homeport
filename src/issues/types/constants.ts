import { translate } from '@waldur/i18n';

export const ISSUE_IDS = {
  INCIDENT: 'Incident',
  CHANGE_REQUEST: 'Change Request',
  SERVICE_REQUEST: 'Service Request',
  INFORMATIONAL: 'Informational',
};

export const getIssueTypeLabel = (issueType) =>
  ({
    INCIDENT: translate('Incident'),
    CHANGE_REQUEST: translate('Change Request'),
    SERVICE_REQUEST: translate('Service Request'),
    INFORMATIONAL: translate('Informational'),
  }[issueType]);

export const ISSUE_ICONS = {
  INCIDENT: 'fa-exclamation-triangle',
  CHANGE_REQUEST: 'fa-check-square',
  SERVICE_REQUEST: 'fa-puzzle-piece',
  INFORMATIONAL: 'fa-question-circle',
};

export const ISSUE_TEXT_CLASSES = {
  INCIDENT: 'text-danger',
  INFORMATIONAL: 'text-warning',
  CHANGE_REQUEST: 'text-success',
  SERVICE_REQUEST: 'text-info',
};

const getIssueDescription = (issueType) =>
  ({
    INCIDENT: translate(
      'Incident - client issue with service usage or availability (interruptions, degradation of quality).',
    ),
    SERVICE_REQUEST: translate(
      'Service Request - client’s request to modify, add, change or remove partially or completely a particular service.',
    ),
    INFORMATIONAL: translate(
      'Informational - client’s request to get or provide additional information related to a service.',
    ),
    CHANGE_REQUEST: translate(
      'Change request - client’s request to perform a generic modification of data or service.',
    ),
  }[issueType]);

export const getIssueTypeChoices = () =>
  Object.keys(ISSUE_IDS).map((item) => ({
    iconClass: ISSUE_ICONS[item],
    textClass: ISSUE_TEXT_CLASSES[item],
    label: getIssueTypeLabel(item),
    description: getIssueDescription(item),
    id: ISSUE_IDS[item],
  }));
