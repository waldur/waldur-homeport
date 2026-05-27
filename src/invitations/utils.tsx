import { InfoIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';

export function getGroupInvitationLink(invitation) {
  return `${location.origin}/user-group-invitation/${invitation.uuid}/`;
}

export const isDuplicateOrConflictError = (errorMessage: unknown): boolean =>
  typeof errorMessage === 'string' &&
  (errorMessage.includes('already exists') ||
    errorMessage.includes('already has'));

export const getDuplicateErrorDialogOptions = () => ({
  title: translate('You already have access'),
  message: translate(
    'You already have the requested role or a pending request for this organization.',
  ),
  options: {
    type: 'primary' as const,
    size: 'sm' as const,
    positiveButton: translate('OK'),
    onlyPositiveButton: true,
    positiveButtonVariant: 'primary w-95px',
    iconNode: <InfoIcon weight="bold" />,
  },
});
