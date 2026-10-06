import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MatrixMessageItem } from './MatrixMessageItem';
import { MatrixChatMessage } from './types';

// One client for the whole file: the media hook refetches whenever its client
// changes, so a fresh object per render would refetch and revoke the blob.
const h = vi.hoisted(() => ({
  client: { baseUrl: 'https://hs.example', getAccessToken: () => 'tok' },
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({ client: h.client }),
}));
vi.mock('./MessageReactionChips', () => ({ MessageReactionChips: () => null }));
vi.mock('./MessageReactionToolbar', () => ({
  MessageReactionToolbar: () => null,
}));

const blobs: Blob[] = [];

beforeEach(() => {
  blobs.length = 0;
  URL.createObjectURL = vi.fn((blob: Blob) => {
    blobs.push(blob);
    return `blob:waldur/${blobs.length}`;
  });
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// The homeserver sends the uploader's type; a blob URL keeps it and opens in
// Waldur's origin, so only types that render inertly may survive.
const serve = (type: string) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response('<script></script>', {
          headers: { 'Content-Type': type },
        }),
      ),
    ),
  );

const attachment = (type: string, body: string, mimetype: string) =>
  ({
    eventId: 'evt-1',
    sender: '@mallory:server',
    senderDisplayName: 'Mallory',
    body,
    timestamp: 1000,
    type,
    url: 'mxc://hs.example/abc',
    info: { mimetype },
  }) as MatrixChatMessage;

const renderItem = (message: MatrixChatMessage) =>
  render(
    <MatrixMessageItem message={message} isOwn={false} senderName="Mallory" />,
  );

describe('MatrixMessageItem attachments', () => {
  it('downloads an HTML file instead of opening it in Waldur', async () => {
    serve('text/html');
    renderItem(attachment('m.file', 'page.html', 'text/html'));

    await waitFor(() => expect(blobs).toHaveLength(1));
    expect(blobs[0].type).toBe('application/octet-stream');
    const link = await screen.findByRole('link');
    expect(link.getAttribute('download')).toBe('page.html');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not open an SVG sent as an image in Waldur', async () => {
    serve('image/svg+xml');
    renderItem(attachment('m.image', 'pic.svg', 'image/svg+xml'));

    await waitFor(() => expect(blobs).toHaveLength(1));
    expect(blobs[0].type).toBe('application/octet-stream');
  });

  it('keeps the type of an image that renders inertly', async () => {
    serve('image/png');
    renderItem(attachment('m.image', 'pic.png', 'image/png'));

    await waitFor(() => expect(blobs).toHaveLength(1));
    expect(blobs[0].type).toBe('image/png');
  });

  it('does not keep a type list whose last entry could run script', async () => {
    // Fetch's own parsing already collapses such a header, so hand the blob
    // over directly to reach the type check with the list intact.
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          blob: () =>
            Promise.resolve(
              new Blob(['<script></script>'], {
                type: 'image/png;a=b,text/html',
              }),
            ),
        }),
      ),
    );
    renderItem(attachment('m.image', 'pic.png', 'image/png'));

    await waitFor(() => expect(blobs).toHaveLength(1));
    expect(blobs[0].type).toBe('application/octet-stream');
  });
});
