import { describe, expect, it } from 'vitest';

import {
  CALL_ENDED_MESSAGE_TYPE,
  CALL_STARTED_MESSAGE_TYPE,
  CallTransition,
  callStateAtTimelineStart,
  findCallTransitions,
} from './callTimeline';

const CALL_MEMBER_EVENT = 'org.matrix.msc3401.call.member';
const HOUR = 60 * 60 * 1000;
const T0 = 1_700_000_000_000;

function stateEvent(
  id: string,
  stateKey: string,
  sender: string,
  content: any,
  ts: number,
) {
  return {
    getId: () => id,
    getType: () => CALL_MEMBER_EVENT,
    getStateKey: () => stateKey,
    getSender: () => sender,
    getContent: () => content,
    getTs: () => ts,
  } as any;
}

const deviceKey = (user: string, device: string) => `_${user}_${device}_m.call`;

// matrix-js-sdk leaves `created_ts` out of a membership's first publish; only
// its refreshes carry it.
const join = (
  id: string,
  user: string,
  device: string,
  ts: number,
  createdTs?: number,
) =>
  stateEvent(
    id,
    deviceKey(user, device),
    user,
    {
      application: 'm.call',
      call_id: '',
      device_id: device,
      expires: HOUR,
      ...(createdTs === undefined ? {} : { created_ts: createdTs }),
    },
    ts,
  );

const leave = (id: string, user: string, device: string, ts: number) =>
  stateEvent(id, deviceKey(user, device), user, {}, ts);

const message = (id: string, ts: number) =>
  ({
    getId: () => id,
    getType: () => 'm.room.message',
    getStateKey: () => undefined,
    getSender: () => '@alice:s',
    getContent: () => ({ msgtype: 'm.text', body: 'hi' }),
    getTs: () => ts,
  }) as any;

// A start lists who has been on the call; an end lists no one.
const summary = (transitions: Map<string, CallTransition>) =>
  [...transitions].map(([id, { type, participants }]) =>
    type === CALL_STARTED_MESSAGE_TYPE ? [id, type, participants] : [id, type],
  );

describe('findCallTransitions', () => {
  it('marks the first membership as the start of a call', () => {
    const transitions = findCallTransitions(
      [],
      [message('m1', T0), join('j1', '@alice:s', 'A', T0 + 1)],
    );
    expect(summary(transitions)).toEqual([
      ['j1', CALL_STARTED_MESSAGE_TYPE, ['@alice:s']],
    ]);
  });

  it('does not start a call again when a membership is refreshed', () => {
    const transitions = findCallTransitions(
      [],
      [
        join('j1', '@alice:s', 'A', T0),
        join('j2', '@alice:s', 'A', T0 + HOUR - 2 * 60_000, T0),
      ],
    );
    expect(summary(transitions)).toEqual([
      ['j1', CALL_STARTED_MESSAGE_TYPE, ['@alice:s']],
    ]);
  });

  it('lists everyone who was on the call on its start, not a row each', () => {
    const transitions = findCallTransitions(
      [],
      [
        join('j1', '@alice:s', 'A', T0),
        join('j2', '@bob:s', 'B', T0 + 1000),
        leave('l1', '@alice:s', 'A', T0 + 2000),
        leave('l2', '@bob:s', 'B', T0 + 3000),
      ],
    );
    expect(summary(transitions)).toEqual([
      ['j1', CALL_STARTED_MESSAGE_TYPE, ['@alice:s', '@bob:s']],
      ['l2', CALL_ENDED_MESSAGE_TYPE],
    ]);
  });

  // Each tab is a device of its own, so a second tab is not a second person.
  it('lists a user once, whichever devices they join from', () => {
    const transitions = findCallTransitions(
      [],
      [
        join('j1', '@alice:s', 'A', T0),
        join('j2', '@alice:s', 'B', T0 + 1000),
        leave('l1', '@alice:s', 'A', T0 + 2000),
      ],
    );
    expect(summary(transitions)).toEqual([
      ['j1', CALL_STARTED_MESSAGE_TYPE, ['@alice:s']],
    ]);
  });

  it('ends a call that was already running when the loaded history begins', () => {
    const transitions = findCallTransitions(
      [join('j0', '@alice:s', 'A', T0)],
      [message('m1', T0 + 1000), leave('l1', '@alice:s', 'A', T0 + 2000)],
    );
    expect(summary(transitions)).toEqual([['l1', CALL_ENDED_MESSAGE_TYPE]]);
  });

  // A tab that dies without leaving keeps its membership until it expires;
  // the next call must still read as started.
  it('starts a new call once a membership left behind has expired', () => {
    const transitions = findCallTransitions(
      [],
      [
        join('j1', '@alice:s', 'A', T0),
        join('j2', '@bob:s', 'B', T0 + 2 * HOUR),
      ],
    );
    expect(summary(transitions)).toEqual([
      ['j1', CALL_STARTED_MESSAGE_TYPE, ['@alice:s']],
      ['j2', CALL_STARTED_MESSAGE_TYPE, ['@bob:s']],
    ]);
  });

  it('reads the legacy layout that lists all of a user’s devices', () => {
    const legacy = (id: string, memberships: any[], ts: number) =>
      stateEvent(id, '@alice:s', '@alice:s', { memberships }, ts);
    const transitions = findCallTransitions(
      [],
      [
        legacy('j1', [{ device_id: 'A', created_ts: T0, expires: HOUR }], T0),
        legacy('l1', [], T0 + 1000),
      ],
    );
    expect(summary(transitions)).toEqual([
      ['j1', CALL_STARTED_MESSAGE_TYPE, ['@alice:s']],
      ['l1', CALL_ENDED_MESSAGE_TYPE],
    ]);
  });

  it('ignores memberships of other calls in the room', () => {
    const other = stateEvent(
      'j1',
      deviceKey('@alice:s', 'A'),
      '@alice:s',
      {
        application: 'm.call',
        call_id: 'breakout',
        device_id: 'A',
        created_ts: T0,
        expires: HOUR,
      },
      T0,
    );
    expect(findCallTransitions([], [other]).size).toBe(0);
  });
});

describe('callStateAtTimelineStart', () => {
  const withPrev = (event: any, prevContent: any) => ({
    ...event,
    getPrevContent: () => prevContent ?? {},
    getUnsigned: () => (prevContent ? { prev_content: prevContent } : {}),
  });

  // The room's state is its current one, as after the last timeline event.
  const roomWith = (currentState: any[]) =>
    ({
      currentState: {
        getStateEvents: (type: string) =>
          type === CALL_MEMBER_EVENT ? currentState : [],
      },
    }) as any;

  const transitionsOf = (currentState: any[], events: any[]) =>
    findCallTransitions(
      callStateAtTimelineStart(roomWith(currentState), events),
      events,
    );

  // matrix-js-sdk's own start-of-timeline state takes the state a sync reports
  // beside its timeline, which Tuwunel fills with the timeline's own events: a
  // call that starts live would read as already running.
  it('starts a call whose first membership is in the timeline', () => {
    const first = withPrev(join('j1', '@alice:s', 'A', T0), null);
    expect(
      summary(transitionsOf([first], [message('m1', T0 - 1), first])),
    ).toEqual([['j1', CALL_STARTED_MESSAGE_TYPE, ['@alice:s']]]);
  });

  it('keeps a membership from before the timeline running', () => {
    const running = join('j0', '@alice:s', 'A', T0);
    const gone = withPrev(
      leave('l1', '@alice:s', 'A', T0 + 1000),
      running.getContent(),
    );
    expect(
      summary(transitionsOf([gone], [message('m1', T0 + 500), gone])),
    ).toEqual([['l1', CALL_ENDED_MESSAGE_TYPE]]);
  });

  // The membership the leave replaces carries no `created_ts`, and its own
  // event is not loaded to tell when it was published.
  it('keeps a call from before the timeline running while others come and go', () => {
    const MINUTE = 60_000;
    const running = join('j0', '@alice:s', 'A', T0);
    const events = [
      withPrev(join('j1', '@bob:s', 'B', T0 + 10 * MINUTE), null),
      withPrev(
        leave('l1', '@bob:s', 'B', T0 + 20 * MINUTE),
        join('j1', '@bob:s', 'B', T0 + 10 * MINUTE).getContent(),
      ),
      withPrev(
        leave('l2', '@alice:s', 'A', T0 + 30 * MINUTE),
        running.getContent(),
      ),
    ];
    expect(summary(transitionsOf([events[1], events[2]], events))).toEqual([
      ['l2', CALL_ENDED_MESSAGE_TYPE],
    ]);
  });

  it('counts memberships the timeline does not touch as they are now', () => {
    const other = join('j0', '@bob:s', 'B', T0);
    const first = withPrev(join('j1', '@alice:s', 'A', T0 + 1000), null);
    // The call started before the timeline, so its start row is not loaded.
    expect(transitionsOf([other, first], [first]).size).toBe(0);
  });
});
