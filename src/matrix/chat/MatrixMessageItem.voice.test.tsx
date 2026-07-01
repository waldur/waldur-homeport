import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  client: {
    baseUrl: 'https://hs.example',
    getAccessToken: () => 'token',
  } as any,
}));

// A working client + a fetch that yields a blob lets useAuthenticatedMediaUrl
// resolve to a blob URL so the media branch (player vs <audio>) is reachable.
vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({ client: h.client }),
}));
vi.mock('./MessageReactionChips', () => ({
  MessageReactionChips: () => null,
}));
vi.mock('./MessageReactionToolbar', () => ({
  MessageReactionToolbar: () => null,
}));

import { MatrixMessageItem } from './MatrixMessageItem';
import { MatrixChatMessage } from './types';

const audioMessage = (
  extra: Partial<MatrixChatMessage>,
): MatrixChatMessage => ({
  eventId: 'evt-audio',
  sender: '@alice:server',
  senderDisplayName: 'Alice',
  body: 'Voice message',
  timestamp: 1000,
  type: 'm.audio',
  url: 'mxc://hs.example/media123',
  info: { mimetype: 'audio/webm' },
  ...extra,
});

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    blob: () => Promise.resolve(new Blob(['audio'], { type: 'audio/webm' })),
  } as any);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:voice');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MatrixMessageItem voice rendering', () => {
  it('renders the waveform player for a voice message', async () => {
    render(
      <MatrixMessageItem
        message={audioMessage({
          isVoice: true,
          waveform: [0, 512, 1024],
          durationMs: 3000,
        })}
        isOwn={false}
        senderName="Alice"
      />,
    );

    // The player exposes a Play button; the plain <audio> fallback would not.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument(),
    );
    expect(screen.getByText('00:03')).toBeInTheDocument();
  });

  it('renders native audio (no player) for an m.audio without a waveform', async () => {
    const { container } = render(
      <MatrixMessageItem
        message={audioMessage({})}
        isOwn={false}
        senderName="Alice"
      />,
    );

    await waitFor(() => {
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      expect(container.querySelector('audio')).not.toBeNull();
    });
    expect(screen.queryByRole('button', { name: 'Play' })).toBeNull();
  });
});
