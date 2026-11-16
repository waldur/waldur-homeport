import {
  OpenStepDiscussionRequest,
  StepDiscussion,
  StepDiscussionViewer,
} from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { translate } from '@/i18n';

/**
 * What a step's discussion offers its viewer: to start it, to open it, to
 * read how it went once closed, or, on a step that runs again, to start a
 * new one beside the closed one's record. A start or an open the viewer may
 * not make now carries why.
 */
export type DiscussionAction =
  | { kind: 'start'; disabledReason?: string }
  | { kind: 'open'; disabledReason?: string }
  | { kind: 'closed' }
  | { kind: 'restart' };

/**
 * The action for a step's discussion as the backend shows it to the viewer:
 * none when the step has no discussion or the viewer has no part in it.
 * `chatEnabled` is whether Matrix chat is usable in the portal, without
 * which the room cannot be shown: then only a closed discussion's record is
 * offered. A step may keep a dormant discussion while chat is disabled.
 */
export const discussionAction = (
  discussion:
    Pick<StepDiscussionViewer, 'state' | 'can_open'> | null | undefined,
  chatEnabled: boolean,
): DiscussionAction | null => {
  if (!discussion) return null;
  // The step's latest discussion: a closed one the viewer may open belongs
  // to a step running again, where opening starts a new discussion.
  if (discussion.state === 'closed') {
    return discussion.can_open && chatEnabled
      ? { kind: 'restart' }
      : { kind: 'closed' };
  }
  const kind = discussion.state === 'open' ? 'open' : 'start';
  // Without chat, a step's discussion can be neither had nor shown; only a
  // closed one's record stays.
  if (!chatEnabled) return null;
  if (!discussion.can_open) {
    return {
      kind,
      disabledReason:
        kind === 'start'
          ? translate(
              'The discussion can be started while the step is active, by the people taking part in it.',
            )
          : translate(
              'Only the people taking part in the discussion can open it, while the step is active.',
            ),
    };
  }
  return { kind };
};

export const discussionStateLabel = (state: string): string =>
  ({
    not_opened: translate('Not started'),
    open: translate('Open'),
    closed: translate('Closed'),
  })[state] ?? state;

/** The badge colour of a discussion's state: open green, closed grey. */
export const discussionStateVariant = (state: string): BadgeVariant =>
  (
    ({
      not_opened: 'info',
      open: 'success',
      closed: 'secondary',
    }) as Record<string, BadgeVariant>
  )[state] ?? 'secondary';

/**
 * What opens a discussion, listed or startable: its proposal's step, or its
 * round step and panel -- the body `proposalStepDiscussionsOpen` takes.
 */
export const discussionTarget = (
  row: Pick<
    StepDiscussion,
    'proposal_step_uuid' | 'round_step_uuid' | 'panel_uuid'
  >,
): OpenStepDiscussionRequest =>
  row.proposal_step_uuid
    ? { proposal_step_uuid: row.proposal_step_uuid }
    : { round_step_uuid: row.round_step_uuid, panel_uuid: row.panel_uuid };
