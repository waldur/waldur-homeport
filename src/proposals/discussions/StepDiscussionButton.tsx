import {
  ChatsCircleIcon,
  LockSimpleIcon,
  PlusCircleIcon,
} from '@phosphor-icons/react';
import { InvalidateQueryFilters, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useRef } from 'react';
import {
  OpenStepDiscussionRequest,
  StepDiscussionViewer,
  proposalStepDiscussionsOpen,
  proposalStepDiscussionsRetrieve,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { isMatrixChatEnabled } from '@/matrix/utils';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useArchivedCallReason } from '@/proposals/archivedCall';
import { useNotify } from '@/store/notify';
import { openSupportDrawer } from '@/support/openSupportDrawer';
import { useUser } from '@/workspace/hooks';

import { discussionAction } from './discussionAction';
import { MY_DISCUSSIONS_KEY } from './queries';
import {
  DiscussionRoomOutcome,
  httpStatus,
  waitForDiscussionRoom,
} from './waitForDiscussionRoom';

const StepDiscussionClosedDialog = lazyComponent(() =>
  import('./StepDiscussionClosedDialog').then((module) => ({
    default: module.StepDiscussionClosedDialog,
  })),
);

/**
 * Open a step's discussion -- starting it the first time, joining it after --
 * and show its room in the team chat, whose call view holds the video. The
 * room and its members are made in the background after the discussion
 * opens, so the drawer waits for the room to take the user in: shown any
 * earlier, it would only say the user is not a member.
 */
export const useOpenStepDiscussion = ({
  invalidateQueries = [],
  refetch,
}: {
  invalidateQueries?: InvalidateQueryFilters[];
  /** Reloads what shows the discussion's state, once the open settles. */
  refetch?(): void;
} = {}) => {
  const { openDrawer } = useDrawer();
  const { showError, showErrorResponse } = useNotify();
  const queryClient = useQueryClient();
  const userUuid = useUser()?.uuid;
  // The wait for a room is this flow's alone: a new open replaces it, and
  // leaving the page ends it.
  const waitAbortRef = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      waitAbortRef.current?.abort();
      waitAbortRef.current = null;
    },
    [],
  );
  return useManagedMutation<
    DiscussionRoomOutcome,
    any,
    OpenStepDiscussionRequest
  >({
    mutationFn: async (body) => {
      waitAbortRef.current?.abort();
      const controller = new AbortController();
      waitAbortRef.current = controller;
      const discussion = (await proposalStepDiscussionsOpen({ body })).data;
      return waitForDiscussionRoom(discussion, {
        userUuid,
        signal: controller.signal,
        fetchDiscussion: (uuid, signal) =>
          proposalStepDiscussionsRetrieve({ path: { uuid }, signal }).then(
            (response) => response.data,
          ),
      });
    },
    // Never inside a dialog: nothing to close.
    closeModal: false,
    onSuccess: ({ status, discussion }) => {
      if (status === 'ready' && discussion.room_uuid) {
        openSupportDrawer(openDrawer, {
          defaultRoomUuid: discussion.room_uuid,
          discussion: true,
          title: translate('Discussions'),
        });
      } else if (status === 'error') {
        showError(
          translate(
            'The discussion room could not be created. Try again later, or contact support if it keeps failing.',
          ),
        );
      } else if (status === 'timeout') {
        showError(
          translate(
            'The discussion room is not ready yet. Try opening the discussion again in a moment.',
          ),
        );
      }
    },
    onError: (error) => {
      // Whoever does not take part is refused before anything is said about
      // the step, so the refusal reads as that, not as a failure.
      if (httpStatus(error) === 403) {
        showError(
          translate(
            'Only the people working on the step take part in its discussion.',
          ),
        );
      } else {
        showErrorResponse(error, translate('Unable to open the discussion.'));
      }
    },
    // Also after a refusal, say a step that has just closed, so the page
    // does not keep offering what the backend no longer allows.
    onSettled: () => {
      [
        ...invalidateQueries,
        { queryKey: MY_DISCUSSIONS_KEY },
        // The team chat's rooms, so the new room is listed at once rather
        // than once the Matrix client notices the invitation.
        { queryKey: ['matrixRoomsAll'] },
      ].forEach((filters) => queryClient.invalidateQueries(filters));
      refetch?.();
    },
  });
};

interface StepDiscussionButtonProps {
  discussion: Pick<StepDiscussionViewer, 'uuid' | 'state' | 'can_open'>;
  /** Which discussion to open: a proposal's step, or a round step's panel. */
  target: OpenStepDiscussionRequest;
  /** Names the panel a round step's discussion is for, on a call with panels. */
  panelName?: string | null;
  /** Queries showing the discussion's state, reloaded once it opens. */
  invalidateQueries?: InvalidateQueryFilters[];
  /** Reloads what shows its state, once an open settles. */
  refetch?(): void;
  /** The proposal's step it is about: an award-stage one's discussion goes
   * on in an archived call. None for a round step's. */
  step?: { phase?: string | null; step?: string | null } | null;
}

/**
 * The button of a step's discussion: start it, open it, or, once closed, read
 * who took part and download its history. On a step running again, a closed
 * discussion also offers to start a new one.
 */
export const StepDiscussionButton: FC<StepDiscussionButtonProps> = ({
  discussion,
  target,
  panelName,
  invalidateQueries,
  refetch,
  step,
}) => {
  const { openDialog } = useModal();
  const open = useOpenStepDiscussion({ invalidateQueries, refetch });
  // No discussion is started or joined on an archived call's steps.
  const archived = useArchivedCallReason(step);
  const action = discussionAction(discussion, isMatrixChatEnabled());
  if (!action) return null;

  const suffix = (label: string) =>
    panelName
      ? translate('{label} ({panel})', { label, panel: panelName })
      : label;
  // A long panel name truncates within its column; the full label stays the
  // button's accessible name, and its tooltip when nothing else takes it.
  const fitting = (label: string) => ({
    label: <span className="truncate">{suffix(label)}</span>,
    tooltip: panelName ? suffix(label) : undefined,
    className: 'max-w-80 min-w-0',
  });

  // A closed discussion was opened, so it has its record: who took part and
  // the export of its history.
  const recordUuid = discussion.uuid;
  const closedRecord = (label: string) =>
    recordUuid ? (
      <BaseButton
        variant="tertiary"
        size="sm"
        iconNode={<LockSimpleIcon weight="bold" />}
        {...fitting(label)}
        onClick={() =>
          openDialog(StepDiscussionClosedDialog, {
            resolve: { discussionUuid: recordUuid },
          })
        }
        data-testid="step-discussion-closed"
      />
    ) : null;

  if (action.kind === 'closed') {
    return closedRecord(translate('Discussion closed'));
  }
  const starts = action.kind === 'start' || action.kind === 'restart';
  const disabledReason =
    archived ?? (action.kind === 'restart' ? undefined : action.disabledReason);
  const button = (
    <BaseButton
      variant={starts ? 'primary' : 'tertiary'}
      size="sm"
      iconNode={
        starts ? (
          <PlusCircleIcon weight="bold" />
        ) : (
          <ChatsCircleIcon weight="bold" />
        )
      }
      {...fitting(
        action.kind === 'restart'
          ? translate('Start a new discussion')
          : starts
            ? translate('Start discussion')
            : translate('Open discussion'),
      )}
      disabled={Boolean(disabledReason)}
      disabledReason={disabledReason}
      pending={open.isPending}
      onClick={() => open.mutate(target)}
      data-testid={
        action.kind === 'restart'
          ? 'step-discussion-restart'
          : starts
            ? 'step-discussion-start'
            : 'step-discussion-open'
      }
    />
  );
  // A step running again: a new discussion, with the closed one on record.
  if (action.kind === 'restart') {
    return (
      <span className="inline-flex flex-wrap gap-1.5 max-w-full">
        {button}
        {closedRecord(translate('Previous discussion'))}
      </span>
    );
  }
  return button;
};
