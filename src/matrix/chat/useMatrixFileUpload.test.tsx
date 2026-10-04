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

import { useMatrixFileUpload } from './useMatrixFileUpload';

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
