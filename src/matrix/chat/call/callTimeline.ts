import type { MatrixEvent, Room } from 'matrix-js-sdk';

import { CALL_MEMBER_EVENT } from './callMembership';
import { parseCallMemberEvents } from './parseCallMembers';

/** Message types of the rows marking where the room's call started and ended. */
export const CALL_STARTED_MESSAGE_TYPE = 'waldur.call.started';
export const CALL_ENDED_MESSAGE_TYPE = 'waldur.call.ended';

export type CallTransitionType =
  typeof CALL_STARTED_MESSAGE_TYPE | typeof CALL_ENDED_MESSAGE_TYPE;

export interface CallTransition {
  type: CallTransitionType;
  /**
   * On a start, everyone who has been on the call so far, by user id in the
   * order they joined; it grows as the call goes on. Empty on an end.
   */
  participants: string[];
}

/** A call member state entry: an event, or what its state key held before. */
interface CallMemberState {
  getStateKey(): string | undefined;
  getSender(): string | undefined;
  getContent(): Record<string, any>;
  getTs(): number;
}

export const isCallTransitionType = (
  type: string,
): type is CallTransitionType =>
  type === CALL_STARTED_MESSAGE_TYPE || type === CALL_ENDED_MESSAGE_TYPE;

// Users, not devices: each tab is a device of its own.
const usersInCall = (state: Map<string, CallMemberState>, now: number) =>
  new Set(parseCallMemberEvents([...state.values()], now).map((m) => m.userId));

/**
 * The call member events of a stretch of timeline at which the room's call
 * started (its first membership appeared) or ended (its last one went), by
 * event id. One row each, however many people come and go in between: the
 * start lists them instead. `initialState` is the call member state where the
 * stretch begins.
 *
 * A membership counts while it was valid at the time of each event, not now:
 * one left behind by a tab that closed without leaving stops holding the call
 * open once it expires, so the next call still reads as started. Its own
 * expiry sends no event, so that call gets no "ended" row.
 */
export function findCallTransitions(
  initialState: CallMemberState[],
  events: MatrixEvent[],
): Map<string, CallTransition> {
  const state = new Map<string, CallMemberState>();
  for (const event of initialState) {
    state.set(event.getStateKey() ?? '', event);
  }
  const transitions = new Map<string, CallTransition>();
  // The start of the call in progress, while it is in the stretch.
  let started: CallTransition | null = null;
  for (const event of events) {
    if (event.getType() !== CALL_MEMBER_EVENT) continue;
    const stateKey = event.getStateKey();
    const eventId = event.getId();
    if (stateKey === undefined || !eventId) continue;
    const ts = event.getTs();
    const before = usersInCall(state, ts);
    state.set(stateKey, event);
    const after = usersInCall(state, ts);
    const sender = event.getSender() ?? '';
    if (!before.size && after.size) {
      started = { type: CALL_STARTED_MESSAGE_TYPE, participants: [sender] };
      transitions.set(eventId, started);
    } else if (before.size && !after.size) {
      transitions.set(eventId, {
        type: CALL_ENDED_MESSAGE_TYPE,
        participants: [],
      });
      started = null;
    } else if (
      started &&
      after.has(sender) &&
      !started.participants.includes(sender)
    ) {
      started.participants.push(sender);
    }
  }
  return transitions;
}

/**
 * The call member state where `events`, the room's loaded timeline, begins:
 * the current state rolled back over them, each member event giving way to
 * what its state key held before it (`prev_content`). matrix-js-sdk's own
 * state at the start of the timeline can't stand in: it also takes the state
 * a sync reports beside its timeline, which Tuwunel fills with the timeline's
 * own events, so a call starting live would read as already running.
 */
export function callStateAtTimelineStart(
  room: Room,
  events: MatrixEvent[],
): CallMemberState[] {
  const state = new Map<string, CallMemberState>();
  const current: MatrixEvent[] = (room.currentState as any).getStateEvents(
    CALL_MEMBER_EVENT,
  );
  for (const event of current) state.set(event.getStateKey() ?? '', event);
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.getType() !== CALL_MEMBER_EVENT) continue;
    const stateKey = event.getStateKey();
    if (stateKey === undefined) continue;
    state.set(stateKey, previousState(event, events[0].getTs()));
  }
  return [...state.values()];
}

// What an event's state key held before it. That was published before the
// timeline begins, and matrix-js-sdk's first publish has no `created_ts`, so
// the timeline's start stands in for its time: the latest it can have been.
// The event's own time would read it as not yet created at everything before
// the event, so a call running when the history begins would read as over.
const previousState = (
  event: MatrixEvent,
  timelineStart: number,
): CallMemberState => ({
  getStateKey: () => event.getStateKey(),
  getSender: () => event.getUnsigned().prev_sender ?? event.getSender(),
  getContent: () => event.getPrevContent(),
  getTs: () => timelineStart,
});
