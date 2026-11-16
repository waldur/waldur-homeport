import { StepDiscussion } from 'waldur-js-client';

/** How often, and how many times, a room being created is asked about. */
const ROOM_POLL_INTERVAL_MS = 1500;
const ROOM_POLL_ATTEMPTS = 20;

/**
 * Whether the discussion's room can be shown to the user now. Its room is
 * created by a background task after the discussion opens, and its members
 * are added by another one after that, so a room can be active before the
 * user is in it; the room refuses whoever is not.
 */
export const discussionRoomState = (
  discussion: Pick<StepDiscussion, 'room_uuid' | 'room_state' | 'participants'>,
  userUuid: string | undefined,
): 'ready' | 'pending' | 'error' => {
  if (discussion.room_state === 'error') return 'error';
  if (discussion.room_state !== 'active' || !discussion.room_uuid) {
    return 'pending';
  }
  // While open, the participants are those in the room now.
  if (
    userUuid &&
    !(discussion.participants ?? []).some(
      (participant) => participant.uuid === userUuid,
    )
  ) {
    return 'pending';
  }
  return 'ready';
};

/** The status of a failed request: the SDK attaches its Response. */
export const httpStatus = (error: unknown): number | undefined =>
  (error as any)?.response?.status ?? (error as any)?.status;

export type DiscussionRoomOutcome =
  | { status: 'ready'; discussion: StepDiscussion }
  | { status: 'error' | 'timeout' | 'aborted'; discussion: StepDiscussion };

const pause = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal.aborted) return resolve();
    const timer = setTimeout(done, ms);
    function done() {
      clearTimeout(timer);
      signal.removeEventListener('abort', done);
      resolve();
    }
    signal.addEventListener('abort', done);
  });

/**
 * Wait for the room of a discussion just opened to be ready for the user,
 * starting from what the open returned and asking the backend about it again
 * a bounded number of times. Not found counts as not ready yet; any other
 * error ends the wait. Resolves with what became of it; an abort ends the
 * wait at once.
 */
export const waitForDiscussionRoom = async (
  discussion: StepDiscussion,
  {
    userUuid,
    fetchDiscussion,
    signal,
    attempts = ROOM_POLL_ATTEMPTS,
    interval = ROOM_POLL_INTERVAL_MS,
  }: {
    userUuid: string | undefined;
    fetchDiscussion(uuid: string, signal: AbortSignal): Promise<StepDiscussion>;
    signal: AbortSignal;
    attempts?: number;
    interval?: number;
  },
): Promise<DiscussionRoomOutcome> => {
  let current = discussion;
  for (let attempt = 0; ; attempt++) {
    if (signal.aborted) return { status: 'aborted', discussion: current };
    const state = discussionRoomState(current, userUuid);
    if (state !== 'pending') return { status: state, discussion: current };
    if (attempt >= attempts) return { status: 'timeout', discussion: current };
    await pause(interval, signal);
    if (signal.aborted) return { status: 'aborted', discussion: current };
    try {
      current = await fetchDiscussion(current.uuid, signal);
    } catch (error) {
      if (signal.aborted) return { status: 'aborted', discussion: current };
      // The discussion shows to the members of its room, so the one who
      // opened it cannot read it until the member sync takes them in.
      if (httpStatus(error) !== 404) throw error;
    }
  }
};
