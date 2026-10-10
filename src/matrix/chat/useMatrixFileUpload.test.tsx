import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ client: null as any }));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({ client: h.client, activeRoomId: '!room:hs' }),
}));
vi.mock('./MatrixComposerDraftContext', () => ({
  useMatrixComposerDraft: () => ({ draft: { files: [] }, setFiles: vi.fn() }),
}));

import { NotifyService } from '@/store/notify';

import { decryptAttachment } from './attachmentCrypto';
import { UploadedMedia } from './types';
import { useMatrixFileUpload } from './useMatrixFileUpload';
import { buildVoiceContent } from './voice/buildVoiceContent';

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMatrixFileUpload with an expired access token', () => {
  it('renews the token and uploads again after a 401', async () => {
    // uploadContent sends the client's token itself, so it misses the SDK's
    // refresh until another request renews the token.
    h.client = {
      uploadContent: vi
        .fn()
        .mockRejectedValueOnce({ httpStatus: 401, errcode: 'M_UNKNOWN_TOKEN' })
        .mockResolvedValueOnce({ content_uri: 'mxc://hs/file' }),
      whoami: vi.fn().mockResolvedValue({}),
      getAccessToken: () => 'token',
      sendMessage: vi.fn().mockResolvedValue({}),
      getRoom: () => ({ hasEncryptionStateEvent: () => false }),
    };
    const { result } = renderHook(() => useMatrixFileUpload());
    const file = new File(['notes'], 'notes.txt', { type: 'text/plain' });

    let sent: boolean;
    await act(async () => {
      sent = await result.current.uploadFile(file);
    });

    expect(sent).toBe(true);
    expect(h.client.uploadContent).toHaveBeenCalledTimes(2);
    expect(h.client.whoami).toHaveBeenCalledTimes(1);
    expect(h.client.sendMessage).toHaveBeenCalledWith(
      '!room:hs',
      expect.objectContaining({ url: 'mxc://hs/file' }),
    );
    expect(NotifyService.error).not.toHaveBeenCalled();
  });
});

describe('useMatrixFileUpload in an encrypted room', () => {
  const encryptedClient = () => ({
    uploadContent: vi
      .fn()
      .mockResolvedValue({ content_uri: 'mxc://hs/cipher' }),
    sendMessage: vi.fn().mockResolvedValue({}),
    getRoom: () => ({ hasEncryptionStateEvent: () => true }),
    getAccessToken: () => 'token',
    whoami: vi.fn(),
  });

  const send = async (
    file: File,
    buildContent?: (media: UploadedMedia) => Record<string, any>,
  ) => {
    const { result } = renderHook(() => useMatrixFileUpload());
    let sent: boolean;
    await act(async () => {
      sent = await result.current.uploadFile(file, buildContent);
    });
    return sent;
  };

  // The uploaded body is the ciphertext; decrypting it with the sent `file`
  // must give back the original bytes.
  const decryptSent = async () => {
    const [body] = h.client.uploadContent.mock.calls[0];
    const content = h.client.sendMessage.mock.calls[0][1];
    return new TextDecoder().decode(
      await decryptAttachment(await (body as Blob).arrayBuffer(), content.file),
    );
  };

  it.each([
    ['notes.txt', 'text/plain', 'm.file'],
    ['clip.mp4', 'video/mp4', 'm.video'],
    ['song.ogg', 'audio/ogg', 'm.audio'],
  ])(
    'sends %s as ciphertext with a file object',
    async (name, type, msgtype) => {
      h.client = encryptedClient();
      const sent = await send(new File(['secret bytes'], name, { type }));

      expect(sent).toBe(true);
      const [body, opts] = h.client.uploadContent.mock.calls[0];
      // The homeserver learns neither the name nor the type.
      expect(opts).toEqual({
        type: 'application/octet-stream',
        includeFilename: false,
      });
      expect(await (body as Blob).text()).not.toContain('secret bytes');

      const content = h.client.sendMessage.mock.calls[0][1];
      expect(content).toMatchObject({
        msgtype,
        body: name,
        info: { mimetype: type, size: 12 },
        file: { url: 'mxc://hs/cipher', v: 'v2' },
      });
      expect(content).not.toHaveProperty('url');
      expect(await decryptSent()).toBe('secret bytes');
    },
  );

  it('sends an image with its dimensions', async () => {
    h.client = encryptedClient();
    vi.stubGlobal(
      'Image',
      class {
        naturalWidth = 640;
        naturalHeight = 480;
        onload?: () => void;
        set src(_: string) {
          setTimeout(() => this.onload?.());
        }
      },
    );
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();

    await send(new File(['png'], 'photo.png', { type: 'image/png' }));
    vi.unstubAllGlobals();

    const content = h.client.sendMessage.mock.calls[0][1];
    expect(content).toMatchObject({
      msgtype: 'm.image',
      info: { mimetype: 'image/png', w: 640, h: 480 },
      file: { url: 'mxc://hs/cipher' },
    });
    expect(content).not.toHaveProperty('url');
    // No thumbnail is sent, so none can leak in clear.
    expect(content.info).not.toHaveProperty('thumbnail_url');
    expect(await decryptSent()).toBe('png');
  });

  it('sends a voice message as an encrypted file', async () => {
    h.client = encryptedClient();
    await send(
      new File(['ogg'], 'voice-message', { type: 'audio/ogg' }),
      (media) =>
        buildVoiceContent({
          media,
          mimetype: 'audio/ogg',
          size: 3,
          durationMs: 1500,
          waveform: [0, 0.5, 1],
        }),
    );

    const content = h.client.sendMessage.mock.calls[0][1];
    expect(content).toMatchObject({
      msgtype: 'm.audio',
      file: { url: 'mxc://hs/cipher', v: 'v2' },
      info: { mimetype: 'audio/ogg', size: 3, duration: 1500 },
      'org.matrix.msc3245.voice': {},
      'org.matrix.msc1767.audio': { duration: 1500, waveform: [0, 512, 1024] },
    });
    expect(content).not.toHaveProperty('url');
    expect(await decryptSent()).toBe('ogg');
  });
});

describe('useMatrixFileUpload when only the crypto store knows the room is encrypted', () => {
  it('still encrypts the file', async () => {
    // A homeserver can drop or reset the state event; matrix-js-sdk still
    // encrypts the event, so the file must be encrypted too.
    h.client = {
      uploadContent: vi
        .fn()
        .mockResolvedValue({ content_uri: 'mxc://hs/cipher' }),
      sendMessage: vi.fn().mockResolvedValue({}),
      getRoom: () => ({ hasEncryptionStateEvent: () => false }),
      getCrypto: () => ({
        isEncryptionEnabledInRoom: vi.fn().mockResolvedValue(true),
      }),
      getAccessToken: () => 'token',
      whoami: vi.fn(),
    };
    const { result } = renderHook(() => useMatrixFileUpload());
    await act(async () => {
      await result.current.uploadFile(
        new File(['secret'], 'secret.txt', { type: 'text/plain' }),
      );
    });

    expect(h.client.uploadContent).toHaveBeenCalledTimes(1);
    expect(h.client.uploadContent.mock.calls[0][1]).toEqual({
      type: 'application/octet-stream',
      includeFilename: false,
    });
    const content = h.client.sendMessage.mock.calls[0][1];
    expect(content).toHaveProperty('file');
    expect(content).not.toHaveProperty('url');
  });
});

describe('useMatrixFileUpload when the room turns encrypted mid-upload', () => {
  it('uploads again encrypted and never sends the clear url', async () => {
    let encrypted = false;
    h.client = {
      uploadContent: vi.fn((_body, opts) => {
        // The encryption state event lands while the clear upload runs.
        encrypted = true;
        return Promise.resolve({
          content_uri:
            opts.includeFilename === false
              ? 'mxc://hs/cipher'
              : 'mxc://hs/clear',
        });
      }),
      sendMessage: vi.fn().mockResolvedValue({}),
      getRoom: () => ({ hasEncryptionStateEvent: () => encrypted }),
      getAccessToken: () => 'token',
      whoami: vi.fn(),
    };
    const { result } = renderHook(() => useMatrixFileUpload());
    let sent: boolean;
    await act(async () => {
      sent = await result.current.uploadFile(
        new File(['secret'], 'secret.txt', { type: 'text/plain' }),
      );
    });

    expect(sent).toBe(true);
    expect(h.client.uploadContent).toHaveBeenCalledTimes(2);
    expect(h.client.uploadContent.mock.calls[1][1]).toEqual({
      type: 'application/octet-stream',
      includeFilename: false,
    });
    const content = h.client.sendMessage.mock.calls[0][1];
    expect(content).toMatchObject({ file: { url: 'mxc://hs/cipher' } });
    expect(content).not.toHaveProperty('url');
  });
});

describe('useMatrixFileUpload with a malformed upload response', () => {
  it('sends nothing when the content_uri is not a valid mxc URI', async () => {
    h.client = {
      uploadContent: vi
        .fn()
        .mockResolvedValue({ content_uri: 'mxc://../config' }),
      sendMessage: vi.fn(),
      getRoom: () => ({ hasEncryptionStateEvent: () => false }),
      getAccessToken: () => 'token',
      whoami: vi.fn(),
    };
    const { result } = renderHook(() => useMatrixFileUpload());
    let sent: boolean;
    await act(async () => {
      sent = await result.current.uploadFile(
        new File(['x'], 'x.txt', { type: 'text/plain' }),
      );
    });

    expect(sent).toBe(false);
    expect(h.client.sendMessage).not.toHaveBeenCalled();
    expect(NotifyService.error).toHaveBeenCalled();
  });
});

describe('useMatrixFileUpload in an unencrypted room', () => {
  it('sends a voice message with a plain url', async () => {
    h.client = {
      uploadContent: vi
        .fn()
        .mockResolvedValue({ content_uri: 'mxc://hs/clip' }),
      sendMessage: vi.fn().mockResolvedValue({}),
      getRoom: () => ({ hasEncryptionStateEvent: () => false }),
      getAccessToken: () => 'token',
      whoami: vi.fn(),
    };
    const { result } = renderHook(() => useMatrixFileUpload());
    await act(async () => {
      await result.current.uploadFile(
        new File(['ogg'], 'voice-message', { type: 'audio/ogg' }),
        (media) =>
          buildVoiceContent({
            media,
            mimetype: 'audio/ogg',
            size: 3,
            durationMs: 1500,
            waveform: [],
          }),
      );
    });

    expect(h.client.uploadContent).toHaveBeenCalledWith(expect.any(File), {
      name: 'voice-message',
      type: 'audio/ogg',
    });
    const content = h.client.sendMessage.mock.calls[0][1];
    expect(content).toMatchObject({ msgtype: 'm.audio', url: 'mxc://hs/clip' });
    expect(content).not.toHaveProperty('file');
  });
});

describe('useMatrixFileUpload in a room the client does not know yet', () => {
  it('waits for a room that is still loading, which may be encrypted', async () => {
    h.client = {
      uploadContent: vi.fn(),
      sendMessage: vi.fn(),
      getRoom: () => null,
    };
    const { result } = renderHook(() => useMatrixFileUpload());

    let sent: boolean;
    await act(async () => {
      sent = await result.current.uploadFile(
        new File(['x'], 'x.txt', { type: 'text/plain' }),
      );
    });

    expect(sent).toBe(false);
    expect(h.client.uploadContent).not.toHaveBeenCalled();
  });
});

describe('useMatrixFileUpload with extra content', () => {
  const reply = {
    'm.mentions': { user_ids: ['@alice:hs'] },
    'm.relates_to': { 'm.in_reply_to': { event_id: '$p' } },
  };
  const upload = async (
    buildContent?: (media: UploadedMedia) => Record<string, any>,
  ) => {
    const { result } = renderHook(() => useMatrixFileUpload());
    await act(async () => {
      await result.current.uploadFile(
        new File(['x'], 'x.ogg', { type: 'audio/ogg' }),
        buildContent,
        reply,
      );
    });
    return h.client.sendMessage.mock.calls[0];
  };
  const client = (encrypted: boolean) => ({
    uploadContent: vi.fn().mockResolvedValue({ content_uri: 'mxc://hs/f' }),
    getAccessToken: () => 'token',
    sendMessage: vi.fn().mockResolvedValue({}),
    getRoom: () => ({ hasEncryptionStateEvent: () => encrypted }),
  });

  it('adds the fields to a file sent in clear, as a reply does', async () => {
    h.client = client(false);
    const [, content] = await upload();
    expect(content).toMatchObject({ url: 'mxc://hs/f', ...reply });
  });

  it('puts them in the content of an encrypted file, which the SDK encrypts', async () => {
    h.client = client(true);
    const [roomId, content, ...rest] = await upload();
    expect(roomId).toBe('!room:hs');
    // One content object, carrying `file`: nothing goes beside it.
    expect(rest).toEqual([]);
    expect(content).toMatchObject({
      file: { url: 'mxc://hs/f', v: 'v2' },
      ...reply,
    });
    expect(content).not.toHaveProperty('url');
  });

  it('adds them to custom content too, as a voice reply does', async () => {
    h.client = client(true);
    const [, content] = await upload((media) => ({
      msgtype: 'm.audio',
      body: 'voice',
      ...media,
    }));
    expect(content).toMatchObject({
      msgtype: 'm.audio',
      file: { url: 'mxc://hs/f' },
      ...reply,
    });
  });
});
