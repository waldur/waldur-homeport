import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, useState } from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { createTestQueryClient, renderWithProviders } from '@/test/harness';

import {
  CALL_ENDED_MESSAGE_TYPE,
  CALL_STARTED_MESSAGE_TYPE,
} from './call/callTimeline';
import { MatrixMessageItem } from './MatrixMessageItem';
import { MatrixMessageList } from './MatrixMessageList';
import { MatrixChatMessage } from './types';
import { useRoomBotUserId } from './useRoomBotUserId';

// The list renders MatrixMessageItem, which reaches into the Matrix client
// context for media — irrelevant here, so stub it to a plain node. A spy so
// tests can assert how often the rows actually re-render.
vi.mock('./useRoomBotUserId', () => ({ useRoomBotUserId: vi.fn(() => null) }));
vi.mock('./MatrixMessageItem', () => ({
  MatrixMessageItem: vi.fn(() => <div data-testid="msg" />),
}));

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
});

const message = (eventId: string, timestamp: number): MatrixChatMessage => ({
  eventId,
  sender: '@alice:server',
  senderDisplayName: 'Alice',
  body: 'hello',
  timestamp,
  type: 'm.text',
});

const renderList = (props: Record<string, unknown> = {}) =>
  renderWithProviders(
    <MatrixMessageList
      messages={[message('evt-1', 1000), message('evt-2', 2000)]}
      userId="@me:server"
      memberNames={new Map()}
      loading={false}
      loadingOlder={false}
      hasOlderMessages={false}
      onLoadOlder={vi.fn()}
      onReadLatest={vi.fn()}
      {...props}
    />,
  );

describe('MatrixMessageList read receipts', () => {
  it('reports the latest message as read once messages are loaded', () => {
    const onReadLatest = vi.fn();
    renderList({ onReadLatest });
    expect(onReadLatest).toHaveBeenCalledWith('evt-2');
  });

  it('does not report a read while still loading', () => {
    const onReadLatest = vi.fn();
    renderList({ onReadLatest, loading: true });
    expect(onReadLatest).not.toHaveBeenCalled();
  });

  it('does not report a read when there are no messages', () => {
    const onReadLatest = vi.fn();
    renderList({ onReadLatest, messages: [] });
    expect(onReadLatest).not.toHaveBeenCalled();
  });
});

describe('MatrixMessageList memoization', () => {
  // Regression guard: composer keystrokes update a shared draft context that
  // MatrixChatDrawer also consumes, so the drawer re-renders on every keypress.
  // The list must bail out when its own props are unchanged, otherwise every
  // message row re-renders per keystroke (typing jank in busy rooms).
  it('does not re-render the rows when the parent re-renders with identical props', async () => {
    const user = userEvent.setup();
    const itemMock = vi.mocked(MatrixMessageItem);
    // Stable prop references across parent re-renders — created once.
    const props = {
      messages: [message('evt-1', 1000), message('evt-2', 2000)],
      userId: '@me:server',
      memberNames: new Map<string, string>(),
      loading: false,
      loadingOlder: false,
      hasOlderMessages: false,
      onLoadOlder: vi.fn(),
      onReadLatest: vi.fn(),
    };
    const Parent: FC = () => {
      const [, setTick] = useState(0);
      return (
        <>
          <button onClick={() => setTick((t) => t + 1)}>bump</button>
          <MatrixMessageList {...props} />
        </>
      );
    };
    renderWithProviders(<Parent />);
    itemMock.mockClear();

    await user.click(screen.getByText('bump'));

    expect(itemMock).not.toHaveBeenCalled();
  });
});

describe('MatrixMessageList call rows', () => {
  const callRow = (
    eventId: string,
    timestamp: number,
    type: string,
  ): MatrixChatMessage => ({ ...message(eventId, timestamp), body: '', type });

  it('shows where a call started and ended instead of message rows', () => {
    renderList({
      messages: [
        message('evt-1', 1000),
        callRow('join-1', 2000, CALL_STARTED_MESSAGE_TYPE),
        callRow('leave-1', 3000, CALL_ENDED_MESSAGE_TYPE),
      ],
      memberNames: new Map([['@alice:server', 'Alice Smith']]),
    });

    expect(screen.getByText('Alice Smith started a call')).toBeInTheDocument();
    expect(screen.getByText('Call ended')).toBeInTheDocument();
    expect(screen.getAllByTestId('msg')).toHaveLength(1);
  });

  it('lists who was on a group call on its start', () => {
    renderList({
      messages: [
        {
          ...callRow('join-1', 2000, CALL_STARTED_MESSAGE_TYPE),
          callParticipants: [
            { userId: '@alice:server', displayName: 'alice' },
            { userId: '@me:server', displayName: 'me' },
          ],
        },
      ],
      memberNames: new Map([['@alice:server', 'Alice Smith']]),
    });

    expect(
      screen.getByText('Group call started: Alice Smith, You'),
    ).toBeInTheDocument();
  });

  it('tells the user when they started the call themselves', () => {
    renderList({
      messages: [
        {
          ...callRow('join-1', 2000, CALL_STARTED_MESSAGE_TYPE),
          sender: '@me:server',
        },
      ],
    });

    expect(screen.getByText('You started a call')).toBeInTheDocument();
  });

  // The call row sits between the two messages, so the second one must show
  // its sender again rather than read as part of the first.
  it('does not group a message with one sent before the call row', () => {
    const itemMock = vi.mocked(MatrixMessageItem);
    itemMock.mockClear();
    renderList({
      messages: [
        message('evt-1', 1000),
        callRow('join-1', 2000, CALL_STARTED_MESSAGE_TYPE),
        message('evt-2', 3000),
      ],
    });

    const second = itemMock.mock.calls.find(
      ([props]) => props.message.eventId === 'evt-2',
    );
    expect(second?.[0].continuation).toBe(false);
  });
});

describe('MatrixMessageList empty state', () => {
  // Regression guard: without the scroll container, the fill-if-too-short
  // effect can never run, so an empty timeline never auto-backfills history.
  it('mounts the scroll container even when there are no messages', () => {
    const { container } = renderList({ messages: [] });
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('.tc-stream')).not.toBeNull();
  });
});

describe('MatrixMessageList scroll preservation', () => {
  // Regression guard: prepending history must not yank the viewport to the
  // bottom while the user is reading older messages.
  // Regression guard: the initial scrollIntoView fires a scroll event with
  // scrollTop=0 when content fits the viewport. That must NOT be mistaken
  // for "user scrolled to top" and trigger an anchored history load — the
  // load would then re-anchor the viewport mid-history instead of bottom.
  it('does not anchor-load history when content fits the viewport', () => {
    const onLoadOlder = vi.fn();
    const { container } = renderList({
      onLoadOlder,
      hasOlderMessages: true,
    });

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const stream = container.querySelector('.tc-stream') as HTMLDivElement;
    Object.defineProperty(stream, 'scrollHeight', {
      value: 500,
      configurable: true,
    });
    Object.defineProperty(stream, 'clientHeight', {
      value: 500,
      configurable: true,
    });
    Object.defineProperty(stream, 'scrollTop', {
      value: 0,
      configurable: true,
    });
    fireEvent.scroll(stream);

    expect(onLoadOlder).not.toHaveBeenCalled();
  });

  // Regression guard: media (images/video) resolves asynchronously and grows
  // the stream after the one-shot initial scroll. While parked at the bottom,
  // that growth must re-pin to the newest message instead of stranding the
  // viewport half a screen above it.
  it('re-pins to bottom when media finishes loading while parked at bottom', () => {
    const { container } = renderList();
    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);
    scrollIntoView.mockClear();

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const msg = container.querySelector('[data-testid="msg"]') as HTMLElement;
    fireEvent.load(msg);

    expect(scrollIntoView).toHaveBeenCalled();
  });

  // Regression guard: the stream container only mounts once `loading` flips
  // false. The media-load listener must (re)bind at that point — binding only
  // on first mount reads a null ref while the spinner is shown and silently
  // never attaches, so media growth after open strands the viewport.
  it('binds the media-load re-pin after loading flips false', () => {
    const baseProps = {
      messages: [message('evt-1', 1000), message('evt-2', 2000)],
      userId: '@me:server',
      memberNames: new Map<string, string>(),
      loadingOlder: false,
      hasOlderMessages: false,
      onLoadOlder: vi.fn(),
      onReadLatest: vi.fn(),
    };
    const { container, rerender } = renderWithProviders(
      <MatrixMessageList {...baseProps} loading={true} />,
    );
    // While loading there is no stream to bind to.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('.tc-stream')).toBeNull();

    rerender(<MatrixMessageList {...baseProps} loading={false} />);

    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);
    scrollIntoView.mockClear();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const msg = container.querySelector('[data-testid="msg"]') as HTMLElement;
    fireEvent.load(msg);

    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('does not re-pin on media load when the user has scrolled up', () => {
    const { container } = renderList({
      messages: [message('evt-2', 2000), message('evt-3', 3000)],
      hasOlderMessages: true,
    });

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const stream = container.querySelector('.tc-stream') as HTMLDivElement;
    Object.defineProperty(stream, 'scrollHeight', {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(stream, 'clientHeight', {
      value: 500,
      configurable: true,
    });
    Object.defineProperty(stream, 'scrollTop', {
      value: 200,
      configurable: true,
    });
    fireEvent.scroll(stream); // marks wasAtBottom = false

    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);
    scrollIntoView.mockClear();

    // eslint-disable-next-line testing-library/no-node-access
    const msg = stream.querySelector('[data-testid="msg"]') as HTMLElement;
    fireEvent.load(msg);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('does not scroll to bottom when older messages prepend while user is scrolled up', () => {
    const { container, rerender } = renderList({
      messages: [message('evt-2', 2000), message('evt-3', 3000)],
      hasOlderMessages: true,
    });

    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);
    scrollIntoView.mockClear();

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const stream = container.querySelector('.tc-stream') as HTMLDivElement;
    Object.defineProperty(stream, 'scrollHeight', {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(stream, 'clientHeight', {
      value: 500,
      configurable: true,
    });
    Object.defineProperty(stream, 'scrollTop', {
      value: 200,
      configurable: true,
    });
    fireEvent.scroll(stream);

    rerender(
      <MatrixMessageList
        messages={[
          message('evt-0', 0),
          message('evt-1', 1000),
          message('evt-2', 2000),
          message('evt-3', 3000),
        ]}
        userId="@me:server"
        memberNames={new Map()}
        loading={false}
        loadingOlder={false}
        hasOlderMessages={true}
        onLoadOlder={vi.fn()}
        onReadLatest={vi.fn()}
      />,
    );

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('MatrixMessageList ticket drafts', () => {
  const BOT = '@waldur-bot:server';
  const DRAFT = 'a'.repeat(32);

  const botNotice = (
    eventId: string,
    timestamp: number,
    block: Record<string, unknown>,
  ): MatrixChatMessage => ({
    eventId,
    sender: BOT,
    senderDisplayName: 'Waldur',
    body: 'notice',
    timestamp,
    type: 'm.notice',
    assistantBlocks: [{ draft_uuid: DRAFT, ...block }],
  });

  const draftNotice = botNotice('evt-draft', 3000, {
    key: 'support_ticket_draft',
    requester: '@me:server',
    title: 'VM does not boot',
    description: 'It hangs.',
  });
  const cancelledNotice = botNotice('evt-cancelled', 4000, {
    key: 'support_ticket_cancelled',
    reason: 'replaced',
  });
  const history = [message('evt-1', 1000), message('evt-2', 2000)];

  beforeAll(() => {
    vi.mocked(useRoomBotUserId).mockReturnValue(BOT);
  });
  afterAll(() => {
    vi.mocked(useRoomBotUserId).mockReturnValue(null);
  });
  afterEach(() => {
    vi.mocked(MatrixMessageItem).mockClear();
  });

  const commandsRefreshed = (spy: ReturnType<typeof vi.spyOn>) =>
    spy.mock.calls.some(
      ([filters]: any) => filters?.queryKey?.[0] === 'MatrixRoomCommands',
    );

  it('hands the bot’s follow-up to the draft’s card', () => {
    renderList({ messages: [...history, draftNotice, cancelledNotice] });
    const props = vi.mocked(MatrixMessageItem).mock.calls.at(-1)![0];
    expect(props.ticketDraftOutcomes?.get(DRAFT)).toEqual({
      state: 'cancelled',
    });
    expect(props.roomBotUserId).toBe(BOT);
  });

  it('refreshes the composer’s commands when the bot posts a ticket notice', () => {
    const { rerender, queryClient } = renderList({ messages: history });
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    rerender(
      <MatrixMessageList
        messages={[...history, draftNotice]}
        userId="@me:server"
        memberNames={new Map()}
        loading={false}
        loadingOlder={false}
        hasOlderMessages={false}
        onLoadOlder={vi.fn()}
      />,
    );
    expect(spy).toHaveBeenCalledWith({ queryKey: ['MatrixRoomCommands'] });
  });

  it('does not refresh them for the notices a room opens with', () => {
    const queryClient = createTestQueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const props = {
      userId: '@me:server',
      memberNames: new Map<string, string>(),
      loadingOlder: false,
      hasOlderMessages: false,
      onLoadOlder: vi.fn(),
    };
    const { rerender } = renderWithProviders(
      <MatrixMessageList {...props} messages={[]} loading={true} />,
      { queryClient },
    );
    rerender(
      <MatrixMessageList
        {...props}
        messages={[...history, draftNotice]}
        loading={false}
      />,
    );
    expect(commandsRefreshed(spy)).toBe(false);
    rerender(
      <MatrixMessageList
        {...props}
        messages={[...history, draftNotice, message('evt-3', 5000)]}
        loading={false}
      />,
    );
    expect(commandsRefreshed(spy)).toBe(false);
  });
});
