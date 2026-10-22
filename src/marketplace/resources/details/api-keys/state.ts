import { Resource, ResourceApiKeyAction, User } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { translate } from '@/i18n';
import {
  getRestrictionHeldBy,
  getRestrictionResumes,
  RestrictedResource,
} from '@/marketplace/resources/details/spendingLimitRestriction';
import { checkIsStaffOrSupport } from '@/workspace/selectors';

import { ApiKeyRow, ApiKeyState } from './types';

export const getStateVariant = (
  state?: ApiKeyState,
): { variant: BadgeVariant; active: boolean } => {
  if (state === 'Erred') return { variant: 'danger', active: false };
  if (state === 'OK') return { variant: 'success', active: false };
  if (state === 'Paused') return { variant: 'warning', active: false };
  if (state === 'Deleted') return { variant: 'secondary', active: false };
  return { variant: 'success', active: true };
};

// A personal key is revealed only by its assignee, or by staff and support;
// the backend refuses anyone else.
export const canRevealKey = (row: ApiKeyRow, user?: User) =>
  row.state === 'OK' &&
  (!row.user_uuid ||
    row.user_uuid === user?.uuid ||
    Boolean(checkIsStaffOrSupport(user)));

// The assignee holds the key's value, so may replace it: rotate the key, or
// retry a rotation of it that failed. Every other command stays with whoever
// manages the resource's users.
export const isKeyAssignee = (row: ApiKeyRow, user?: User) =>
  Boolean(row.user_uuid) && row.user_uuid === user?.uuid;

// Commands every key-carrying backend takes, governed or not.
export const UNGOVERNED_COMMANDS: ResourceApiKeyAction[] = ['rotate', 'resume'];

// An Erred key keeps the command that failed; one that erred before commands
// were recorded was rotating.
export const getFailedCommand = (row: ApiKeyRow): ResourceApiKeyAction =>
  (row.pending_action || 'rotate') as ResourceApiKeyAction;

// Under key management, a key that holds a secret changes hands by rotation,
// so its assignee changes only when it can take a rotation: from OK, or from
// Erred after a failed rotation, which is then retried with the new assignee.
// A key that holds no secret yet just takes the new assignee. Mirrors the
// 400 on ``user`` the backend answers otherwise.
export const getAssigneeLock = (row: ApiKeyRow): string | undefined => {
  if (!row.client_id) {
    return undefined;
  }
  if (row.state === 'Paused') {
    return translate('Resume the key to change its assignee.');
  }
  if (row.state === 'Erred') {
    return getFailedCommand(row) === 'rotate'
      ? undefined
      : translate('Retry the failed command first.');
  }
  if (row.pending_action || getStateVariant(row.state).active) {
    return translate('Wait for the current operation to finish.');
  }
  return undefined;
};

const getCommandLabel = (command: ResourceApiKeyAction) =>
  ({
    create: translate('Creation'),
    rotate: translate('Rotation'),
    pause: translate('Pause'),
    resume: translate('Resume'),
    update: translate('Settings update'),
    delete: translate('Deletion'),
  })[command];

export const getErredTooltip = (row: ApiKeyRow) => {
  const failed = translate('{command} failed', {
    command: getCommandLabel(getFailedCommand(row)),
  });
  return row.error_message ? `${failed}: ${row.error_message}` : failed;
};

// A key Waldur paused on reaching a limit comes back on its own, unlike one a
// person paused.
const PAUSED_BY_CAP_TOOLTIP = () =>
  translate(
    'Paused on reaching a limit. It resumes on its own once under its limits again: when a new month begins or a limit is raised.',
  );

// A paused resource stops every key it has, but leaves their own states alone:
// each key keeps its reason to stay paused, or not, for when the resource
// resumes. So a key reads OK while it serves nothing, unless the resource's
// pause is shown on it.
export type ResourcePause = 'limit' | 'other';

export const getResourcePause = (
  resource: Pick<Resource, 'paused' | 'usage_limit_restriction'>,
): ResourcePause | null =>
  resource.paused
    ? resource.usage_limit_restriction === 'paused'
      ? 'limit'
      : 'other'
    : null;

const getResourcePauseMessage = (pause: ResourcePause) =>
  pause === 'limit'
    ? translate(
        'Its usage reached its limit. It resumes on its own once usage is under the limit again: when a limit is raised or a new period begins.',
      )
    : translate('It resumes once the resource is unpaused.');

// The tab's banner names the limit that holds the resource and when it
// resumes, in the Usage tab's words. Without a reached limit to name, it says
// what a key's tooltip does.
export const getResourcePauseDetails = (
  pause: ResourcePause,
  resource: RestrictedResource,
) => {
  const heldBy = pause === 'limit' ? getRestrictionHeldBy(resource) : undefined;
  return heldBy
    ? `${heldBy} ${getRestrictionResumes(resource)}`
    : getResourcePauseMessage(pause);
};

// Only a key that would otherwise serve reads as blocked; a paused, erred or
// changing key already says why it is not serving.
const isBlockedByResource = (row: ApiKeyRow, pause?: ResourcePause | null) =>
  Boolean(pause) && row.state === 'OK';

export const getKeyStateVariant = (
  row: ApiKeyRow,
  pause?: ResourcePause | null,
): { variant: BadgeVariant; active: boolean } =>
  isBlockedByResource(row, pause)
    ? { variant: 'warning', active: false }
    : getStateVariant(row.state);

export const getStateTooltip = (
  row: ApiKeyRow,
  pause?: ResourcePause | null,
) =>
  pause && isBlockedByResource(row, pause)
    ? `${translate('The resource is paused, so this key is not served.')} ${getResourcePauseMessage(pause)}`
    : row.state === 'Erred'
      ? getErredTooltip(row)
      : row.state === 'Paused' && row.paused_by_limit
        ? PAUSED_BY_CAP_TOOLTIP()
        : '';

// Pause, resume, rotate and settings updates all show the key as Updating;
// pending_action says which one is in flight.
export const getStateLabel = (row: ApiKeyRow, pause?: ResourcePause | null) => {
  if (isBlockedByResource(row, pause)) {
    return translate('Blocked: resource paused');
  }
  if (row.state === 'Updating') {
    if (row.pending_action === 'pause') return translate('Pausing');
    if (row.pending_action === 'resume') return translate('Resuming');
    if (row.pending_action === 'rotate') return translate('Rotating');
  }
  if (row.state === 'Paused' && row.paused_by_limit) {
    return translate('Paused at limit');
  }
  const labels: Record<ApiKeyState, string> = {
    Creating: translate('Creating'),
    OK: translate('OK'),
    Updating: translate('Updating'),
    Paused: translate('Paused'),
    Deleting: translate('Deleting'),
    Deleted: translate('Deleted'),
    Erred: translate('Erred'),
  };
  return row.state ? labels[row.state] : undefined;
};
