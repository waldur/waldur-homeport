import { InfoIcon } from '@phosphor-icons/react';
import { SubmitRequestResponse } from 'waldur-js-client';

import { translate } from '@/i18n';

export function getGroupInvitationLink(invitation) {
  return `${location.origin}/user-group-invitation/${invitation.uuid}/`;
}

/**
 * Where to send the user once a group-invitation permission request has been
 * submitted: the created project, the scope project or organization when
 * auto-approved, the pending requests list otherwise.
 */
export const getPostJoinDestination = (
  res: Pick<
    SubmitRequestResponse,
    'auto_approved' | 'scope_uuid' | 'project_uuid' | 'scope_type'
  >,
): { state: string; params?: Record<string, string> } => {
  if (!res.auto_approved) {
    return { state: 'profile.permission-requests' };
  }
  if (res.project_uuid) {
    return { state: 'project.dashboard', params: { uuid: res.project_uuid } };
  }
  if (res.scope_uuid && res.scope_type === 'project') {
    return { state: 'project.dashboard', params: { uuid: res.scope_uuid } };
  }
  // scope_type is absent on backends that predate it; keep the historical
  // organization fallback in that case.
  if (res.scope_uuid && (!res.scope_type || res.scope_type === 'customer')) {
    return {
      state: 'organization.dashboard',
      params: { uuid: res.scope_uuid },
    };
  }
  // Auto-approved on a scope without a dashboard route (offering, call, ...).
  return { state: 'profile.details' };
};

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
