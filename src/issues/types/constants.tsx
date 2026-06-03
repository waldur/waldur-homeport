import {
  ArrowsClockwiseIcon,
  InfoIcon,
  QuestionIcon,
  WarningIcon,
  WrenchIcon,
} from '@phosphor-icons/react';

import { translate } from '@/i18n';

import { RequestType } from '../api';

// Issue type name constants for backward compatibility with existing code
export const ISSUE_IDS = {
  INCIDENT: 'Incident',
  CHANGE_REQUEST: 'Change Request',
  SERVICE_REQUEST: 'Service Request',
  INFORMATIONAL: 'Informational',
} as const;

// Known issue types and their icons (for backward compatibility)
const KNOWN_TYPE_ICONS: Record<string, JSX.Element> = {
  Incident: <WarningIcon weight="bold" />,
  'Change Request': <ArrowsClockwiseIcon weight="bold" />,
  'Service Request': <WrenchIcon weight="bold" />,
  Informational: <InfoIcon weight="bold" />,
};

// Mapping from internal type codes (used in templates) to display names
export const TEMPLATE_TYPE_TO_NAME: Record<string, string> = {
  INCIDENT: 'Incident',
  CHANGE_REQUEST: 'Change Request',
  SERVICE_REQUEST: 'Service Request',
  INFORMATIONAL: 'Informational',
};

// Known issue type descriptions
const KNOWN_TYPE_DESCRIPTIONS: Record<string, string> = {
  Incident: translate(
    'Incident - client issue with service usage or availability (interruptions, degradation of quality).',
  ),
  'Service Request': translate(
    "Service Request - client's request to modify, add, change or remove partially or completely a particular service.",
  ),
  Informational: translate(
    "Informational - client's request to get or provide additional information related to a service.",
  ),
  'Change Request': translate(
    "Change request - client's request to perform a generic modification of data or service.",
  ),
};

const getIconForType = (typeName: string): JSX.Element => {
  return KNOWN_TYPE_ICONS[typeName] || <QuestionIcon weight="bold" />;
};

const getDescriptionForType = (typeName: string): string => {
  return KNOWN_TYPE_DESCRIPTIONS[typeName] || '';
};

export interface IssueTypeChoice {
  id: string;
  label: string;
  iconNode: JSX.Element;
  description: string;
}

// Convert RequestType from API to IssueTypeChoice for UI
const mapRequestTypeToChoice = (rt: RequestType): IssueTypeChoice => ({
  id: rt.name,
  label: rt.name,
  iconNode: getIconForType(rt.name),
  description: getDescriptionForType(rt.name),
});

// Convert list of RequestTypes to IssueTypeChoices
export const mapRequestTypesToChoices = (
  requestTypes: RequestType[],
): IssueTypeChoice[] => requestTypes.map(mapRequestTypeToChoice);
