import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, PropsWithChildren, createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  client: {
    sendTextMessage: vi.fn(),
    sendMessage: vi.fn(),
    getRoom: vi.fn(),
    sendTyping: vi.fn(() => Promise.resolve()),
  } as any,
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({
    client: h.client,
    activeRoomId: '!room:s',
    activeRoomUuid: 'uuid-1',
    connectionState: 'connected',
    userId: '@me:s',
  }),
}));
vi.mock('./useRoomMemberNames', () => ({
  useRoomMemberNames: () => new Map<string, string>(),
}));

import { MatrixComposerDraftProvider } from './MatrixComposerDraftContext';
import { MatrixMessageInput } from './MatrixMessageInput';

const wrapper: FC<PropsWithChildren> = ({ children }) =>
  createElement(MatrixComposerDraftProvider, null, children);

beforeEach(() => {
  h.client.sendTextMessage.mockReset().mockResolvedValue(undefined);
  h.client.sendMessage.mockReset().mockResolvedValue(undefined);
  h.client.getRoom.mockReset().mockReturnValue(null);
});

describe('MatrixMessageInput partial upload failure', () => {
  it('keeps the failed file staged and does not send the text', async () => {
    const user = userEvent.setup();
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'b.png', { type: 'image/png' });
    const uploadFile = vi
      .fn()
      .mockImplementation((f: File) => Promise.resolve(f.name !== 'b.png'));
    const setPending = vi.fn();
    const clearPending = vi.fn();

    render(
      <MatrixMessageInput
        uploadFile={uploadFile}
        uploading={false}
        pendingFiles={[fileA, fileB]}
        addFiles={vi.fn()}
        removePending={vi.fn()}
        setPending={setPending}
        clearPending={clearPending}
      />,
      { wrapper },
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'caption');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(setPending).toHaveBeenCalledWith([fileB]));
    expect(uploadFile).toHaveBeenCalledTimes(2);
    expect(clearPending).not.toHaveBeenCalled();
    expect(h.client.sendTextMessage).not.toHaveBeenCalled(); // text preserved
    expect((textarea as HTMLTextAreaElement).value).toBe('caption');
  });

  it('clears and sends the text when all uploads succeed', async () => {
    const user = userEvent.setup();
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const uploadFile = vi.fn().mockResolvedValue(true);
    const setPending = vi.fn();
    const clearPending = vi.fn();

    render(
      <MatrixMessageInput
        uploadFile={uploadFile}
        uploading={false}
        pendingFiles={[fileA]}
        addFiles={vi.fn()}
        removePending={vi.fn()}
        setPending={setPending}
        clearPending={clearPending}
      />,
      { wrapper },
    );
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'hi');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(h.client.sendTextMessage).toHaveBeenCalledWith('!room:s', 'hi'),
    );
    expect(clearPending).toHaveBeenCalledTimes(1);
  });
});

describe('PendingAttachments object-URL lifecycle', () => {
  it('creates one URL per image and reuses it across re-renders', () => {
    const createSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => 'blob:mock');
    const revokeSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);

    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'b.png', { type: 'image/png' });
    const baseProps = {
      uploadFile: vi.fn(),
      uploading: false,
      addFiles: vi.fn(),
      removePending: vi.fn(),
      setPending: vi.fn(),
      clearPending: vi.fn(),
    };

    const { rerender } = render(
      <MatrixMessageInput {...baseProps} pendingFiles={[fileA]} />,
      { wrapper },
    );
    expect(createSpy).toHaveBeenCalledTimes(1);

    rerender(
      <MatrixMessageInput {...baseProps} pendingFiles={[fileA, fileB]} />,
    );
    expect(createSpy).toHaveBeenCalledTimes(2); // only B, not A again

    rerender(<MatrixMessageInput {...baseProps} pendingFiles={[fileB]} />);
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock'); // A revoked on leave

    createSpy.mockRestore();
    revokeSpy.mockRestore();
  });
});
