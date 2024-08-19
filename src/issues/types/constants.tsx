import {
  CheckSquare,
  PuzzlePiece,
  Question,
  Warning,
} from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';

export const ISSUE_IDS = {
  INCIDENT: 'Incident',
  CHANGE_REQUEST: 'Change Request',
  SERVICE_REQUEST: 'Service Request',
  INFORMATIONAL: 'Informational',
};

const getIssueTypeLabel = (issueType) =>
  ({
    INCIDENT: translate('Incident'),
    CHANGE_REQUEST: translate('Change Request'),
    SERVICE_REQUEST: translate('Service Request'),
    INFORMATIONAL: translate('Informational'),
  })[issueType];

export const ISSUE_ICONS = {
  INCIDENT: <Warning className="text-danger" />,
  CHANGE_REQUEST: <CheckSquare className="text-warning" />,
  SERVICE_REQUEST: <PuzzlePiece className="text-success" />,
  INFORMATIONAL: <Question className="text-info" />,
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
  })[issueType];

export const getIssueTypeChoices = () =>
  Object.keys(ISSUE_IDS).map((item) => ({
    iconNode: ISSUE_ICONS[item],
    label: getIssueTypeLabel(item),
    description: getIssueDescription(item),
    id: ISSUE_IDS[item],
  }));
