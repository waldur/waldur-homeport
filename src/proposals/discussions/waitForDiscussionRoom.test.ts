import { describe, expect, it, vi } from 'vitest';
import { StepDiscussion } from 'waldur-js-client';

import {
  discussionRoomState,
  waitForDiscussionRoom,
} from './waitForDiscussionRoom';

const ME = 'user-1';

const discussion = (overrides: Partial<StepDiscussion> = {}) =>
  ({
    uuid: 'discussion-1',
    state: 'open',
    room_uuid: 'room-1',
    room_state: 'active',
    participants: [{ uuid: ME, full_name: 'Me', username: 'me' }],
    ...overrides,
  }) as StepDiscussion;

const creating = discussion({ room_state: 'creating', participants: [] });

describe('discussionRoomState', () => {
  it('is ready once the room is active and the user is in it', () => {
    expect(discussionRoomState(discussion(), ME)).toBe('ready');
  });

  it('waits while the room is being created', () => {
    expect(discussionRoomState(creating, ME)).toBe('pending');
    expect(
      discussionRoomState(
        discussion({ room_uuid: null, room_state: null }),
        ME,
      ),
    ).toBe('pending');
  });

  // The room turns active before a second task adds its members.
  it('waits for the user to join an active room', () => {
    expect(discussionRoomState(discussion({ participants: [] }), ME)).toBe(
      'pending',
    );
  });

  it('reports a room that failed', () => {
    expect(discussionRoomState(discussion({ room_state: 'error' }), ME)).toBe(
      'error',
    );
  });
});

const options = (fetchDiscussion, signal = new AbortController().signal) => ({
  userUuid: ME,
  fetchDiscussion,
  signal,
  attempts: 3,
  interval: 0,
});

describe('waitForDiscussionRoom', () => {
  it('asks nothing about a room already ready', async () => {
    const fetchDiscussion = vi.fn();
    const outcome = await waitForDiscussionRoom(
      discussion(),
      options(fetchDiscussion),
    );
    expect(outcome.status).toBe('ready');
    expect(fetchDiscussion).not.toHaveBeenCalled();
  });

  it('asks again until the room being created is active', async () => {
    const fetchDiscussion = vi
      .fn()
      .mockResolvedValueOnce(creating)
      .mockResolvedValueOnce(discussion({ participants: [] }))
      .mockResolvedValueOnce(discussion());
    const outcome = await waitForDiscussionRoom(
      creating,
      options(fetchDiscussion),
    );
    expect(outcome.status).toBe('ready');
    expect(outcome.discussion.room_uuid).toBe('room-1');
    expect(fetchDiscussion).toHaveBeenCalledTimes(3);
    expect(fetchDiscussion).toHaveBeenCalledWith(
      'discussion-1',
      expect.any(AbortSignal),
    );
  });

  it('stops on a room that failed', async () => {
    const fetchDiscussion = vi
      .fn()
      .mockResolvedValue(discussion({ room_state: 'error' }));
    const outcome = await waitForDiscussionRoom(
      creating,
      options(fetchDiscussion),
    );
    expect(outcome.status).toBe('error');
    expect(fetchDiscussion).toHaveBeenCalledTimes(1);
  });

  it('gives up after its attempts', async () => {
    const fetchDiscussion = vi.fn().mockResolvedValue(creating);
    const outcome = await waitForDiscussionRoom(
      creating,
      options(fetchDiscussion),
    );
    expect(outcome.status).toBe('timeout');
    expect(fetchDiscussion).toHaveBeenCalledTimes(3);
  });

  it('ends at once when aborted', async () => {
    const controller = new AbortController();
    const fetchDiscussion = vi.fn().mockImplementation(() => {
      controller.abort();
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    });
    const outcome = await waitForDiscussionRoom(
      creating,
      options(fetchDiscussion, controller.signal),
    );
    expect(outcome.status).toBe('aborted');
    expect(fetchDiscussion).toHaveBeenCalledTimes(1);
  });

  it('passes on an error asking about the room', async () => {
    const fetchDiscussion = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(
      waitForDiscussionRoom(creating, options(fetchDiscussion)),
    ).rejects.toThrow('boom');
  });

  // The opener reads the discussion only once the member sync takes them in.
  it('keeps asking while the discussion is not found', async () => {
    const notFound = { response: { status: 404 } };
    const fetchDiscussion = vi
      .fn()
      .mockRejectedValueOnce(notFound)
      .mockRejectedValueOnce(notFound)
      .mockResolvedValueOnce(discussion());
    const outcome = await waitForDiscussionRoom(
      creating,
      options(fetchDiscussion),
    );
    expect(outcome.status).toBe('ready');
    expect(fetchDiscussion).toHaveBeenCalledTimes(3);
  });

  it('gives up on a discussion never found, within its attempts', async () => {
    const fetchDiscussion = vi
      .fn()
      .mockRejectedValue({ response: { status: 404 } });
    const outcome = await waitForDiscussionRoom(
      creating,
      options(fetchDiscussion),
    );
    expect(outcome.status).toBe('timeout');
    expect(fetchDiscussion).toHaveBeenCalledTimes(3);
  });

  it('passes on any other refusal', async () => {
    const fetchDiscussion = vi
      .fn()
      .mockRejectedValue({ response: { status: 403 } });
    await expect(
      waitForDiscussionRoom(creating, options(fetchDiscussion)),
    ).rejects.toEqual({ response: { status: 403 } });
  });
});
