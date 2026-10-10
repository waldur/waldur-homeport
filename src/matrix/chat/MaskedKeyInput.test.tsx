import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { applyMaskedEdit, MaskedKeyInput } from './MaskedKeyInput';

const Harness: FC<{ revealed?: boolean; onValue?: (v: string) => void }> = ({
  revealed = false,
  onValue,
}) => {
  const [value, setValue] = useState('');
  return (
    <MaskedKeyInput
      aria-label="Recovery key"
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
      revealed={revealed}
    />
  );
};

const edit = (
  value: string,
  inputType: string,
  start: number,
  end = start,
  data: string | null = null,
) => applyMaskedEdit(value, { inputType, data, start, end });

describe('applyMaskedEdit', () => {
  it('inserts typed text at the caret, a mask character included', () => {
    expect(edit('abc', 'insertText', 2, 2, 'x')).toEqual({
      value: 'abxc',
      caret: 3,
    });
    expect(edit('abc', 'insertText', 3, 3, '•')?.value).toBe('abc•');
  });

  it('pastes over a selection', () => {
    expect(edit('abcd', 'insertFromPaste', 1, 3, 'XYZ')).toEqual({
      value: 'aXYZd',
      caret: 4,
    });
  });

  it('deletes backwards and forwards', () => {
    expect(edit('abcd', 'deleteContentBackward', 3)?.value).toBe('abd');
    expect(edit('abcd', 'deleteContentBackward', 0)?.value).toBe('abcd');
    expect(edit('abcd', 'deleteContentForward', 0)?.value).toBe('bcd');
    expect(edit('abcd', 'deleteContentBackward', 1, 3)?.value).toBe('ad');
    expect(edit('abcd', 'deleteByCut', 0, 4)?.value).toBe('');
  });

  it('deletes a whole side for word and line deletions', () => {
    expect(edit('abcd', 'deleteWordBackward', 3)).toEqual({
      value: 'd',
      caret: 0,
    });
    expect(edit('abcd', 'deleteSoftLineForward', 1)?.value).toBe('a');
  });

  it('leaves the selection be when there is nothing to insert', () => {
    for (const inputType of [
      'insertText',
      'insertReplacementText',
      'insertFromPaste',
    ]) {
      expect(edit('abcd', inputType, 1, 3, null)).toBeNull();
      expect(edit('abcd', inputType, 1, 3, '')).toBeNull();
    }
  });

  it('refuses undo, redo and drops', () => {
    for (const inputType of ['historyUndo', 'historyRedo', 'insertFromDrop']) {
      expect(edit('abcd', inputType, 2, 2, 'x')).toBeNull();
    }
  });
});

describe('MaskedKeyInput', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is never a password field, and asks password managers to stay away', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Recovery key');

    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('spellcheck', 'false');
    expect(input).toHaveAttribute('data-1p-ignore');
    expect(input).toHaveAttribute('data-lpignore', 'true');
    expect(input).toHaveAttribute('data-bwignore');
    expect(input).toHaveAttribute('data-form-type', 'other');
  });

  it('keeps the key out of the page while hidden, in any browser', async () => {
    // A browser that could mask with CSS gets mask characters too: CSS masking
    // would leave the key in the input's value and its value attribute.
    vi.stubGlobal('CSS', { supports: () => true });
    const user = userEvent.setup();
    const onValue = vi.fn();
    const { container } = render(<Harness onValue={onValue} />);
    const input = screen.getByLabelText('Recovery key');

    await user.type(input, 'EsTA');

    expect(onValue).toHaveBeenLastCalledWith('EsTA');
    expect(input).toHaveValue('••••');
    expect(container.innerHTML).not.toContain('EsTA');
  });

  it('shows mask characters and keeps the real value in state', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    const input = screen.getByLabelText('Recovery key');

    await user.type(input, 'EsTA');
    await user.keyboard('{Backspace}X');

    expect(input).toHaveValue('••••');
    expect(onValue).toHaveBeenLastCalledWith('EsTX');
  });

  it('takes a pasted key whole, and a typed mask character as text', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    const input = screen.getByLabelText('Recovery key');

    await user.click(input);
    await user.paste('EsTA XFpR');
    await user.keyboard('•');

    expect(onValue).toHaveBeenLastCalledWith('EsTA XFpR•');
    expect(input).toHaveValue('•'.repeat(10));
  });

  it('does not undo into mask characters', () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    const input = screen.getByLabelText('Recovery key');

    const undo = new InputEvent('beforeinput', {
      inputType: 'historyUndo',
      cancelable: true,
      bubbles: true,
    });
    input.dispatchEvent(undo);

    expect(undo.defaultPrevented).toBe(true);
    expect(onValue).not.toHaveBeenCalled();
  });

  it('applies an input method composition once, when it ends', () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    const input = screen.getByLabelText('Recovery key') as HTMLInputElement;
    input.focus();

    input.dispatchEvent(new CompositionEvent('compositionstart', { data: '' }));
    // What the browser shows meanwhile is left alone.
    input.value = 'EsT';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(input).toHaveValue('EsT');
    expect(onValue).not.toHaveBeenCalled();

    input.dispatchEvent(
      new CompositionEvent('compositionend', { data: 'EsTA' }),
    );

    expect(onValue).toHaveBeenCalledTimes(1);
    expect(onValue).toHaveBeenLastCalledWith('EsTA');
    expect(input).toHaveValue('••••');
  });

  it('drops mask characters an input method reports with the composed text', () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    const input = screen.getByLabelText('Recovery key') as HTMLInputElement;
    input.focus();

    input.dispatchEvent(new CompositionEvent('compositionstart', { data: '' }));
    input.dispatchEvent(
      new CompositionEvent('compositionend', { data: '••EsTA' }),
    );

    expect(onValue).toHaveBeenLastCalledWith('EsTA');
  });

  it('applies nothing for an empty paste', () => {
    const onValue = vi.fn();
    render(
      <MaskedKeyInput
        aria-label="Recovery key"
        value="EsTA"
        onChange={onValue}
        revealed={false}
      />,
    );
    const input = screen.getByLabelText('Recovery key') as HTMLInputElement;
    input.setSelectionRange(0, 4);

    input.dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'insertFromPaste',
        data: null,
        cancelable: true,
        bubbles: true,
      }),
    );

    expect(onValue).not.toHaveBeenCalled();
    expect(input).toHaveValue('••••');
  });

  it('is not held up by a composition that never ended', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    const { rerender } = render(
      <MaskedKeyInput
        aria-label="Recovery key"
        value=""
        onChange={onValue}
        revealed={false}
      />,
    );
    screen
      .getByLabelText('Recovery key')
      .dispatchEvent(new CompositionEvent('compositionstart', { data: '' }));

    // Revealed and hidden again before the composition ended: a new input.
    rerender(
      <MaskedKeyInput
        aria-label="Recovery key"
        value=""
        onChange={onValue}
        revealed
      />,
    );
    rerender(
      <MaskedKeyInput
        aria-label="Recovery key"
        value=""
        onChange={onValue}
        revealed={false}
      />,
    );
    const input = screen.getByLabelText('Recovery key');
    await user.type(input, 'E');

    expect(onValue).toHaveBeenLastCalledWith('E');
    expect(input).toHaveValue('•');
  });

  it('masks again what an edit it could not cancel left showing', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Recovery key') as HTMLInputElement;

    input.value = 'leak';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(input).toHaveValue('');
  });

  it('refuses drags', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Recovery key');

    const drop = new Event('drop', { cancelable: true, bubbles: true });
    input.dispatchEvent(drop);

    expect(drop.defaultPrevented).toBe(true);
  });

  it('shows a value cleared from outside as empty', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <MaskedKeyInput
        aria-label="Recovery key"
        value="EsTA"
        onChange={vi.fn()}
        revealed={false}
      />,
    );
    const input = screen.getByLabelText('Recovery key');
    expect(input).toHaveValue('••••');

    rerender(
      <MaskedKeyInput
        aria-label="Recovery key"
        value=""
        onChange={vi.fn()}
        revealed={false}
      />,
    );

    expect(input).toHaveValue('');
    await user.click(input);
  });

  it('shows the value when revealed', async () => {
    const user = userEvent.setup();
    render(<Harness revealed />);
    const input = screen.getByLabelText('Recovery key');

    await user.type(input, 'EsTA');

    expect(input).toHaveValue('EsTA');
  });
});
