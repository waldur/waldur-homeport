import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalStepDiscussionsOpen,
  proposalStepDiscussionsRetrieve,
  StepDiscussion,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { openSupportDrawer } from '@/support/openSupportDrawer';
import { renderHookWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { MY_DISCUSSIONS_KEY } from './queries';
import { useOpenStepDiscussion } from './StepDiscussionButton';

const openDrawer = vi.fn();
vi.mock('@/drawer/actions', () => ({
  useDrawer: () => ({ openDrawer, closeDrawer: vi.fn() }),
}));
vi.mock('@/support/openSupportDrawer', () => ({
  openSupportDrawer: vi.fn(),
}));
vi.mock('./waitForDiscussionRoom', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('./waitForDiscussionRoom')>();
  // No pause between the questions, and few of them.
  return {
    ...actual,
    waitForDiscussionRoom: (discussion, options) =>
      actual.waitForDiscussionRoom(discussion, {
        ...options,
        attempts: 3,
        interval: 0,
      }),
  };
});

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

const opens = (value: StepDiscussion) =>
  vi
    .mocked(proposalStepDiscussionsOpen)
    .mockResolvedValue({ data: value } as any);

const retrieves = (...values: StepDiscussion[]) => {
  const mock = vi.mocked(proposalStepDiscussionsRetrieve);
  values.forEach((value) => mock.mockResolvedValueOnce({ data: value } as any));
  return mock;
};

const openDiscussion = async (
  options: Parameters<typeof useOpenStepDiscussion>[0] = {},
) => {
  const rendered = renderHookWithProviders(() =>
    useOpenStepDiscussion(options),
  );
  const invalidate = vi.spyOn(rendered.queryClient, 'invalidateQueries');
  await act(() =>
    rendered.result.current
      .mutateAsync({ proposal_step_uuid: 'step-1' })
      .catch(() => undefined),
  );
  await waitFor(() => expect(rendered.result.current.isIdle).toBe(false));
  return { ...rendered, invalidate };
};

describe('useOpenStepDiscussion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ uuid: ME } as any);
  });

  it('shows a room the user is already in at once', async () => {
    opens(discussion());
    await openDiscussion();
    expect(proposalStepDiscussionsRetrieve).not.toHaveBeenCalled();
    expect(openSupportDrawer).toHaveBeenCalledWith(openDrawer, {
      defaultRoomUuid: 'room-1',
      discussion: true,
      title: 'Discussions',
    });
  });

  it('waits for a room being created to become active before showing it', async () => {
    opens(creating);
    const retrieve = retrieves(
      creating,
      // Active, but its members not added yet.
      discussion({ participants: [] }),
      discussion(),
    );
    await openDiscussion();
    expect(retrieve).toHaveBeenCalledTimes(3);
    expect(retrieve).toHaveBeenCalledWith(
      expect.objectContaining({ path: { uuid: 'discussion-1' } }),
    );
    expect(openSupportDrawer).toHaveBeenCalledTimes(1);
    expect(openSupportDrawer).toHaveBeenCalledWith(openDrawer, {
      defaultRoomUuid: 'room-1',
      discussion: true,
      title: 'Discussions',
    });
  });

  it('says so, instead of showing it, when the room fails', async () => {
    opens(creating);
    retrieves(discussion({ room_state: 'error', participants: [] }));
    await openDiscussion();
    expect(openSupportDrawer).not.toHaveBeenCalled();
    expect(useNotify().showError).toHaveBeenCalledWith(
      expect.stringMatching(/could not be created/),
    );
  });

  it('says so, instead of showing it, when the room takes too long', async () => {
    opens(creating);
    retrieves(creating, creating, creating);
    await openDiscussion();
    expect(proposalStepDiscussionsRetrieve).toHaveBeenCalledTimes(3);
    expect(openSupportDrawer).not.toHaveBeenCalled();
    expect(useNotify().showError).toHaveBeenCalledWith(
      expect.stringMatching(/not ready yet/),
    );
  });

  it('reloads the discussion state also when the open is refused', async () => {
    vi.mocked(proposalStepDiscussionsOpen).mockRejectedValue({
      response: { status: 409 },
    });
    const refetch = vi.fn();
    const workflowStates = { queryKey: ['workflow-states', 'p-1'] };
    const { invalidate } = await openDiscussion({
      invalidateQueries: [workflowStates],
      refetch,
    });
    expect(openSupportDrawer).not.toHaveBeenCalled();
    expect(useNotify().showErrorResponse).toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith(workflowStates);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: MY_DISCUSSIONS_KEY });
    expect(refetch).toHaveBeenCalled();
  });

  it("waits for the opener to be let into a new discussion's room", async () => {
    opens(creating);
    const retrieve = vi
      .mocked(proposalStepDiscussionsRetrieve)
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({ data: discussion() } as any);
    await openDiscussion();
    expect(retrieve).toHaveBeenCalledTimes(2);
    expect(openSupportDrawer).toHaveBeenCalledWith(openDrawer, {
      defaultRoomUuid: 'room-1',
      discussion: true,
      title: 'Discussions',
    });
  });

  // A step running again: the open creates a new discussion and its room.
  it('shows the room of the new discussion started on a step running again', async () => {
    opens(
      discussion({
        uuid: 'discussion-2',
        room_uuid: 'room-2',
        room_state: 'creating',
        participants: [],
      }),
    );
    const retrieve = retrieves(
      discussion({ uuid: 'discussion-2', room_uuid: 'room-2' }),
    );
    await openDiscussion();
    expect(retrieve).toHaveBeenCalledWith(
      expect.objectContaining({ path: { uuid: 'discussion-2' } }),
    );
    expect(openSupportDrawer).toHaveBeenCalledWith(openDrawer, {
      defaultRoomUuid: 'room-2',
      discussion: true,
      title: 'Discussions',
    });
  });

  it('says who takes part when the user does not', async () => {
    vi.mocked(proposalStepDiscussionsOpen).mockRejectedValue({
      response: { status: 403 },
    });
    await openDiscussion();
    expect(useNotify().showError).toHaveBeenCalledWith(
      'Only the people working on the step take part in its discussion.',
    );
    expect(useNotify().showErrorResponse).not.toHaveBeenCalled();
  });
});
