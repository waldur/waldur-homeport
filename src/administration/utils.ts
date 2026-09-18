import {
  InfoIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';

import { translate } from '@/i18n';

export const AnnouncementTypeOptions = [
  {
    label: translate('Information'),
    value: 'information',
  },
  {
    label: translate('Warning'),
    value: 'warning',
  },
  {
    label: translate('Danger'),
    value: 'danger',
  },
];

// `as const` keeps `.variant` a literal type (FeaturedIconVariant, not the
// widened `string` an object literal defaults to) — it flows into
// ModalDialog's `iconColor` prop via AnnouncementDetailsDialog.tsx.
export const ANNOUNCEMENT_ICON = {
  warning: {
    icon: WarningCircleIcon,
    variant: 'warning',
  },
  danger: {
    icon: XCircleIcon,
    variant: 'danger',
  },
  information: {
    icon: InfoIcon,
    variant: 'neutral',
  },
} as const;

export const getAnnouncementTypeLabel = (type) =>
  AnnouncementTypeOptions.find((op) => op.value === type)?.label || type;

export const IssueTemplateTypeOptions = [
  {
    label: translate('Informational'),
    value: 'INFORMATIONAL',
  },
  {
    label: translate('Service request'),
    value: 'SERVICE_REQUEST',
  },
  {
    label: translate('Change request'),
    value: 'CHANGE_REQUEST',
  },
  {
    label: translate('Incident'),
    value: 'INCIDENT',
  },
];
