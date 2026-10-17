import { KeyboardEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { handleComposerPopupKey } from './composerPopupKeys';

const keyEvent = (key: string, shiftKey = false) =>
  ({ key, shiftKey, preventDefault: vi.fn() }) as unknown as KeyboardEvent;

const popup = (activeIndex = 0, items = ['a', 'b', 'c']) => {
  let index = activeIndex;
  const state = {
    items,
    activeIndex,
    setActiveIndex: (update: (i: number) => number) => {
      index = update(index);
    },
    onPick: vi.fn(),
    onClose: vi.fn(),
    index: () => index,
  };
  return state;
};

describe('handleComposerPopupKey', () => {
  it('moves with the arrow keys and wraps around', () => {
    const state = popup(2);
    expect(handleComposerPopupKey(keyEvent('ArrowDown'), state)).toBe(true);
    expect(state.index()).toBe(0);
    expect(handleComposerPopupKey(keyEvent('ArrowUp'), state)).toBe(true);
    expect(state.index()).toBe(2);
  });

  it.each(['Enter', 'Tab'])('picks the active item with %s', (key) => {
    const state = popup(1);
    const e = keyEvent(key);
    expect(handleComposerPopupKey(e, state)).toBe(true);
    expect(state.onPick).toHaveBeenCalledWith('b');
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('picks the last item when the list shrank below the active index', () => {
    const state = popup(5);
    handleComposerPopupKey(keyEvent('Enter'), state);
    expect(state.onPick).toHaveBeenCalledWith('c');
  });

  it('closes with Escape', () => {
    const state = popup();
    expect(handleComposerPopupKey(keyEvent('Escape'), state)).toBe(true);
    expect(state.onClose).toHaveBeenCalled();
  });

  it('leaves Shift+Enter, other keys and an empty list to the composer', () => {
    const state = popup();
    const e = keyEvent('Enter', true);
    expect(handleComposerPopupKey(e, state)).toBe(false);
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(handleComposerPopupKey(keyEvent('a'), state)).toBe(false);
    expect(handleComposerPopupKey(keyEvent('Enter'), popup(0, []))).toBe(false);
    expect(state.onPick).not.toHaveBeenCalled();
  });
});
