import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, PropsWithChildren, useState } from 'react';
import { describe, expect, it } from 'vitest';

import {
  MatrixComposerDraftProvider,
  useMatrixComposerDraft,
} from './MatrixComposerDraftContext';

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <MatrixComposerDraftProvider>{children}</MatrixComposerDraftProvider>
);

describe('useMatrixComposerDraft', () => {
  it('keeps text and files isolated per room', () => {
    const { result, rerender } = renderHook(
      ({ roomId }) => useMatrixComposerDraft(roomId),
      { initialProps: { roomId: '!a:s' as string | null }, wrapper },
    );

    act(() => result.current.setText('hello'));
    act(() => result.current.setFiles(() => [new File(['x'], 'a.png')]));
    rerender({ roomId: '!a:s' });
    expect(result.current.draft.text).toBe('hello');
    expect(result.current.draft.files).toHaveLength(1);

    rerender({ roomId: '!b:s' });
    expect(result.current.draft.text).toBe('');
    expect(result.current.draft.files).toHaveLength(0);

    rerender({ roomId: '!a:s' });
    expect(result.current.draft.text).toBe('hello');
  });

  it('survives a consumer unmount while the provider stays mounted', async () => {
    // Provider mounted once; a child that reads/writes the draft mounts,
    // writes, unmounts (drawer close), then a fresh child remounts and reads.
    const user = userEvent.setup();
    let captured = '';
    const Writer: FC = () => {
      const { setText } = useMatrixComposerDraft('!a:s');
      return <button onClick={() => setText('kept')}>write</button>;
    };
    const Reader: FC = () => {
      const { draft } = useMatrixComposerDraft('!a:s');
      captured = draft.text;
      return null;
    };
    const Host: FC = () => {
      const [showChild, setShow] = useState(true);
      return (
        <MatrixComposerDraftProvider>
          {showChild ? <Writer /> : <Reader />}
          <button onClick={() => setShow((s) => !s)}>toggle</button>
        </MatrixComposerDraftProvider>
      );
    };

    render(<Host />);
    await user.click(screen.getByText('write')); // stage a draft
    await user.click(screen.getByText('toggle')); // unmount Writer, mount Reader
    expect(captured).toBe('kept');
  });

  it('clear() drops a room draft', () => {
    const { result } = renderHook(() => useMatrixComposerDraft('!a:s'), {
      wrapper,
    });
    act(() => result.current.setText('bye'));
    act(() => result.current.clear());
    expect(result.current.draft.text).toBe('');
  });
});
