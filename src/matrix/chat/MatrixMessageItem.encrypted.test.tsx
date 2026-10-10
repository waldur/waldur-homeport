import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { encryptAttachment, EncryptedFile } from './attachmentCrypto';
import { MatrixMessageItem } from './MatrixMessageItem';
import { MatrixChatMessage } from './types';
import { mapEventToMessage } from './utils';

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

// The homeserver stores ciphertext under whatever type the uploader claimed.
const serve = (body: BodyInit, headers: Record<string, string> = {}) => {
  const fetchMock = vi.fn(() =>
    Promise.resolve(
      new Response(body, {
        headers: { 'Content-Type': 'text/html', ...headers },
      }),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

// A response whose body is read as a stream, as a browser's fetch gives it.
const serveStream = (
  stream: ReadableStream<Uint8Array>,
  headers: Record<string, string> = {},
) => {
  const fetchMock = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'image/png', ...headers }),
      body: stream,
    } as unknown as Response),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const encrypt = async (plaintext: string) => {
  const { ciphertext, file } = await encryptAttachment(
    new TextEncoder().encode(plaintext).buffer as ArrayBuffer,
  );
  return {
    ciphertext,
    file: { ...file, url: 'mxc://hs.example/cipher' } as EncryptedFile,
  };
};

const encryptedMessage = (
  type: string,
  file: EncryptedFile | undefined,
  mimetype: string,
  extra: Partial<MatrixChatMessage> = {},
) =>
  ({
    eventId: 'evt-1',
    sender: '@alice:server',
    senderDisplayName: 'Alice',
    body: 'attachment',
    timestamp: 1000,
    type,
    file,
    info: { mimetype },
    ...extra,
  }) as MatrixChatMessage;

const renderItem = (message: MatrixChatMessage) =>
  render(
    <MatrixMessageItem message={message} isOwn={false} senderName="Alice" />,
  );

describe('MatrixMessageItem with an encrypted attachment', () => {
  it('downloads the ciphertext, decrypts it and shows the image', async () => {
    const { ciphertext, file } = await encrypt('png bytes');
    const fetchMock = serve(ciphertext);

    renderItem(encryptedMessage('m.image', file, 'image/png'));

    await waitFor(() =>
      expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:waldur/1'),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://hs.example/_matrix/client/v1/media/download/hs.example/cipher',
      expect.objectContaining({ headers: { Authorization: 'Bearer tok' } }),
    );
    expect(blobs[0].type).toBe('image/png');
    expect(await blobs[0].text()).toBe('png bytes');
  });

  it.each([
    ['m.video', 'video/mp4'],
    ['m.audio', 'audio/ogg'],
  ])('plays %s', async (type, mimetype) => {
    const { ciphertext, file } = await encrypt('media');
    serve(ciphertext);

    renderItem(encryptedMessage(type, file, mimetype));

    await waitFor(() => expect(blobs).toHaveLength(1));
    expect(blobs[0].type).toBe(mimetype);
    expect(await blobs[0].text()).toBe('media');
    expect(screen.queryByText(/could not be decrypted/)).toBeNull();
  });

  it('plays an encrypted voice message', async () => {
    const { ciphertext, file } = await encrypt('ogg');
    serve(ciphertext);

    renderItem(
      encryptedMessage('m.audio', file, 'audio/ogg', {
        isVoice: true,
        waveform: [0, 512, 1024],
        durationMs: 1500,
      }),
    );

    await waitFor(() => expect(blobs).toHaveLength(1));
    expect(await blobs[0].text()).toBe('ogg');
  });

  it('offers a file for download under an inert type', async () => {
    const { ciphertext, file } = await encrypt('<script>alert(1)</script>');
    serve(ciphertext);

    renderItem(encryptedMessage('m.file', file, 'text/html'));

    await waitFor(() =>
      expect(screen.getByRole('link')).toHaveAttribute('href', 'blob:waldur/1'),
    );
    // The sender's mimetype rides inside the event; it never reaches the blob.
    expect(blobs[0].type).toBe('application/octet-stream');
  });

  it('shows an error, never content, when the hash does not match', async () => {
    const { file } = await encrypt('original');
    const { ciphertext: swapped } = await encrypt('swapped');
    serve(swapped);

    renderItem(encryptedMessage('m.image', file, 'image/png'));

    expect(
      await screen.findByText(/This attachment could not be decrypted/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('shows an error without downloading a malformed file object', async () => {
    const fetchMock = serve('');

    renderItem(
      encryptedMessage('m.image', undefined, 'image/png', {
        fileInvalid: true,
      }),
    );

    expect(
      await screen.findByText(/This attachment could not be decrypted/),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a download larger than the memory bound', async () => {
    const { file } = await encrypt('png');
    serve('', { 'Content-Length': String(200 * 1024 * 1024) });

    renderItem(encryptedMessage('m.image', file, 'image/png'));

    expect(
      await screen.findByText(/Attachment unavailable/),
    ).toBeInTheDocument();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('refuses a stream that outgrows the cap without a Content-Length', async () => {
    const { file } = await encrypt('png');
    const chunk = new Uint8Array(1024 * 1024);
    let sent = 0;
    const cancel = vi.fn();
    serveStream(
      new ReadableStream({
        pull(controller) {
          sent += 1;
          controller.enqueue(chunk);
        },
        cancel,
      }),
    );

    renderItem(encryptedMessage('m.image', file, 'image/png'));

    expect(
      await screen.findByText(/Attachment unavailable/),
    ).toBeInTheDocument();
    expect(cancel).toHaveBeenCalled();
    // Reading stopped just past the cap, not at the end of the stream.
    expect(sent).toBeLessThan(110);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('refuses a stream longer than its understated Content-Length', async () => {
    const { file } = await encrypt('png');
    const chunk = new Uint8Array(1024 * 1024);
    const cancel = vi.fn();
    serveStream(
      new ReadableStream({
        pull: (controller) => controller.enqueue(chunk),
        cancel,
      }),
      { 'Content-Length': '10' },
    );

    renderItem(encryptedMessage('m.image', file, 'image/png'));

    expect(
      await screen.findByText(/Attachment unavailable/),
    ).toBeInTheDocument();
    expect(cancel).toHaveBeenCalled();
  });

  it('treats a non-string mimetype as no type', async () => {
    const { ciphertext, file } = await encrypt('png');
    serve(ciphertext);

    renderItem(
      encryptedMessage('m.image', file, 'image/png', {
        info: { mimetype: { evil: true } as any },
      }),
    );

    await waitFor(() => expect(blobs).toHaveLength(1));
    expect(blobs[0].type).toBe('application/octet-stream');
    expect(await blobs[0].text()).toBe('png');
  });

  it.each([
    ['a parent-directory server', 'mxc://../config'],
    ['a nested media id', 'mxc://hs.example/a/b'],
  ])('never fetches a plain url with %s', async (_, url) => {
    const fetchMock = serve('');

    renderItem(encryptedMessage('m.image', undefined, 'image/png', { url }));

    expect(
      await screen.findByText(/Attachment unavailable/),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('aborts the download on unmount', async () => {
    const { file } = await encrypt('png');
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((_url, init: RequestInit) => {
        signal = init.signal ?? undefined;
        return new Promise(() => undefined);
      }),
    );

    const { unmount } = renderItem(
      encryptedMessage('m.image', file, 'image/png'),
    );
    await waitFor(() => expect(signal).toBeDefined());
    unmount();

    expect(signal!.aborted).toBe(true);
  });

  it('stops reading the body on unmount', async () => {
    const { file } = await encrypt('png');
    const cancel = vi.fn();
    let pulls = 0;
    serveStream(
      new ReadableStream({
        pull(controller) {
          pulls += 1;
          // One chunk, then the body stalls as a slow download would.
          if (pulls === 1) controller.enqueue(new Uint8Array(8));
          return new Promise(() => undefined);
        },
        cancel,
      }),
    );

    const { unmount } = renderItem(
      encryptedMessage('m.image', file, 'image/png'),
    );
    await waitFor(() => expect(pulls).toBeGreaterThan(0));
    unmount();

    await waitFor(() => expect(cancel).toHaveBeenCalled());
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('revokes the blob URL on unmount', async () => {
    const { ciphertext, file } = await encrypt('png');
    serve(ciphertext);

    const { unmount } = renderItem(
      encryptedMessage('m.image', file, 'image/png'),
    );
    await waitFor(() => expect(screen.getByRole('img')).toBeInTheDocument());
    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:waldur/1');
  });
});

describe('mapEventToMessage with an encrypted attachment', () => {
  const event = (content: Record<string, unknown>) =>
    ({
      getType: () => 'm.room.message',
      getContent: () => content,
      getSender: () => '@alice:server',
      getId: () => 'evt-1',
      getTs: () => 1000,
      isEncrypted: () => true,
      isDecryptionFailure: () => false,
    }) as any;

  it('keeps a valid file object', async () => {
    const { file } = await encrypt('x');
    const message = mapEventToMessage(
      event({ msgtype: 'm.file', body: 'x.txt', file }),
    );
    expect(message.file).toEqual(file);
    expect(message.fileInvalid).toBeUndefined();
  });

  it('flags a malformed file object instead of using its url', async () => {
    const { file } = await encrypt('x');
    const message = mapEventToMessage(
      event({
        msgtype: 'm.image',
        body: 'x.png',
        url: 'mxc://hs.example/clear',
        file: { ...file, v: 'v1' },
      }),
    );
    expect(message.file).toBeUndefined();
    expect(message.fileInvalid).toBe(true);
  });
});
