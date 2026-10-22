import { Resource, ResourceApiKeyAction, User } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { getSpendingLimitLabel } from '@/marketplace/common/spendingLimits';
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

export const getResourcePauseMessage = (pause: ResourcePause) =>
  pause === 'limit'
    ? translate(
        'Its usage reached its limit. It resumes on its own once usage is under the limit again: when a limit is raised or a new period begins.',
      )
    : translate('It resumes once the resource is unpaused.');

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
