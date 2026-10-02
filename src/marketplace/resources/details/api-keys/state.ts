import { ResourceApiKeyAction, User } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { translate } from '@/i18n';
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
// person paused.
const PAUSED_BY_CAP_TOOLTIP = () =>
  translate(
    'Paused on reaching a limit. It resumes on its own once under its limits again: when a new month begins or a limit is raised.',
  );

export const getStateTooltip = (row: ApiKeyRow) =>
  row.state === 'Erred'
    ? getErredTooltip(row)
    : row.state === 'Paused' && row.paused_by_limit
      ? PAUSED_BY_CAP_TOOLTIP()
      : '';

// Pause, resume, rotate and settings updates all show the key as Updating;
// pending_action says which one is in flight.
export const getStateLabel = (row: ApiKeyRow) => {
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
