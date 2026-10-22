import { Resource, ResourceApiKeyAction, User } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { getSpendingLimitLabel } from '@/marketplace/common/spendingLimits';
import {
  getRestrictionHeldBy,
  getRestrictionResumes,
  RestrictedResource,
} from '@/marketplace/resources/details/spendingLimitRestriction';
import { checkIsStaffOrSupport } from '@/workspace/selectors';

import { ApiKeyRow, ApiKeyState, KeyComponent } from './types';

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

// The backend refuses the assignee a rotation of an active key that reached
// any of its own limits, whatever the period. The period named is the one
// that holds the key longest: the reached limit that resets last.
export const getAtLimitReason = (row: ApiKeyRow): string | undefined => {
  const reached = (row.spending_limit_status ?? []).filter(
    (status) => status.reached,
  );
  if (reached.length === 0) {
    return undefined;
  }
  const longest = reached.reduce((last, status) =>
    new Date(status.resets_at).getTime() > new Date(last.resets_at).getTime()
      ? status
      : last,
  );
  return {
    day: translate(
      'This key has reached its daily limit. A manager can rotate it.',
    ),
    week: translate(
      'This key has reached its weekly limit. A manager can rotate it.',
    ),
    month: translate(
      'This key has reached its monthly limit. A manager can rotate it.',
    ),
    quarter: translate(
      'This key has reached its quarterly limit. A manager can rotate it.',
    ),
    year: translate(
      'This key has reached its yearly limit. A manager can rotate it.',
    ),
  }[longest.period];
};

// A key Waldur paused on reaching a limit comes back on its own, unlike one a
// person paused: when every reached limit resets (limit_resumes_at), or when a
// limit is raised.
const getPausedByLimitTooltip = (
  row: ApiKeyRow,
  components: KeyComponent[],
) => {
  const reached = (row.spending_limit_status ?? []).filter(
    (status) => status.reached,
  );
  const which = reached.length
    ? translate('Paused on reaching a limit: {limits}.', {
        limits: reached
          .map((status) =>
            translate('{limit} of {component}', {
              limit: getSpendingLimitLabel(status.period),
              component:
                components.find((c) => c.type === status.component_type)
                  ?.name || status.component_type,
            }),
          )
          .join(', '),
      })
    : translate('Paused on reaching a limit.');
  const resumesAt = row.limit_resumes_at;
  const resumes = !resumesAt
    ? translate(
        'It resumes on its own once under its limits again, or when a limit is raised.',
      )
    : new Date(resumesAt).getTime() <= Date.now()
      ? translate('It resumes shortly.')
      : translate(
          'It resumes {relative}, on {date}, or when a limit is raised.',
          {
            relative: formatRelative(resumesAt),
            date: formatMediumDateTime(resumesAt),
          },
        );
  return `${which} ${resumes}`;
};

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
  components: KeyComponent[] = [],
) =>
  pause && isBlockedByResource(row, pause)
    ? `${translate('The resource is paused, so this key is not served.')} ${getResourcePauseMessage(pause)}`
    : row.state === 'Erred'
      ? getErredTooltip(row)
      : row.state === 'Paused' && row.paused_by_limit
        ? getPausedByLimitTooltip(row, components)
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
