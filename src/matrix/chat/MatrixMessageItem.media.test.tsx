import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ token: 'old', client: null as any }));

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

beforeEach(() => {
  h.token = 'old';
  // Access tokens now live five minutes: the one read just after expiry is
  // stale until an SDK request renews it.
  h.client = {
    baseUrl: 'https://hs.example',
    getAccessToken: () => h.token,
    whoami: vi.fn(() => {
      h.token = 'new';
      return Promise.resolve({});
    }),
  };
  vi.spyOn(global, 'fetch').mockImplementation((_url, init) => {
    const auth = (init?.headers as Record<string, string>)?.Authorization;
    return Promise.resolve(
      auth === 'Bearer old'
        ? ({ ok: false, status: 401 } as any)
        : ({
            ok: true,
            status: 200,
            blob: () =>
              Promise.resolve(new Blob(['png'], { type: 'image/png' })),
          } as any),
    );
  });
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:image');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MatrixMessageItem media with an expired access token', () => {
  it('renews the token and shows the image', async () => {
    render(
      <MatrixMessageItem
        message={{
          eventId: 'evt-image',
          sender: '@alice:server',
          senderDisplayName: 'Alice',
          body: 'photo.png',
          timestamp: 1000,
          type: 'm.image',
          url: 'mxc://hs.example/media123',
          info: { mimetype: 'image/png' },
        }}
        isOwn={false}
        senderName="Alice"
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:image'),
    );
    expect(h.client.whoami).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Attachment unavailable/)).toBeNull();
  });
});
