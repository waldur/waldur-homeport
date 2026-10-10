import { ChangeEvent, FC, useEffect, useLayoutEffect, useRef } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';

const MASK = '•';

interface MaskedEdit {
  inputType: string;
  data: string | null;
  start: number;
  end: number;
}

/**
 * Apply one edit of the input, as a `beforeinput` event describes it, to the
 * real value. Returns null for edits that are not applied: undo and redo would
 * restore mask characters, and a drag would move them.
 */
export const applyMaskedEdit = (
  value: string,
  { inputType, data, start, end }: MaskedEdit,
): { value: string; caret: number } | null => {
  const replace = (from: number, to: number, text = '') => ({
    value: value.slice(0, from) + text + value.slice(to),
    caret: from + text.length,
  });
  const collapsed = start === end;
  switch (inputType) {
    case 'insertText':
    case 'insertReplacementText':
    case 'insertFromPaste':
      // Nothing to insert (an empty clipboard, say) leaves the selection be.
      return data ? replace(start, end, data) : null;
    case 'deleteContentBackward':
      return collapsed
        ? replace(Math.max(0, start - 1), end)
        : replace(start, end);
    case 'deleteContentForward':
      return collapsed
        ? replace(start, Math.min(value.length, end + 1))
        : replace(start, end);
    // The value shows as one run of mask characters, so a word or a line is
    // everything on that side of the caret.
    case 'deleteWordBackward':
    case 'deleteSoftLineBackward':
    case 'deleteHardLineBackward':
      return replace(collapsed ? 0 : start, end);
    case 'deleteWordForward':
    case 'deleteSoftLineForward':
    case 'deleteHardLineForward':
      return replace(start, collapsed ? value.length : end);
    case 'deleteByCut':
    case 'deleteContent':
      return replace(start, end);
    default:
      return null;
  }
};

interface MaskedKeyInputProps extends Omit<
  FormControlProps,
  'type' | 'value' | 'onChange'
> {
  value: string;
  onChange: (value: string) => void;
  revealed: boolean;
  id?: string;
  autoFocus?: boolean;
  'aria-describedby'?: string;
}

/**
 * A text input that hides what is typed without being a password field:
 * browsers and password managers offer to save whatever goes into one, and a
 * recovery key must not be kept in the browser.
 *
 * While hidden, the input shows mask characters and the real value is kept in
 * the caller's state, so the key is nowhere in the page: masking with
 * `-webkit-text-security` would leave it in the input's value and, as React
 * renders it, in its `value` attribute. The input is then left uncontrolled:
 * each edit is taken from its `beforeinput` event and applied here, and an
 * input method's composition is applied once, when it ends, as React rewriting
 * the value meanwhile would break it. Until then the composed text shows.
 */
export const MaskedKeyInput: FC<MaskedKeyInputProps> = ({
  value,
  onChange,
  revealed,
  ...rest
}) => {
  const masked = !revealed;
  const inputRef = useRef<HTMLInputElement>(null);
  // Read by the listeners below, which are attached once per mount.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const compositionRef = useRef<{ start: number; end: number } | null>(null);

  // A value set from outside (cleared, say) shows as its mask characters.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!masked || !input || compositionRef.current) return;
    const shown = MASK.repeat(value.length);
    if (input.value !== shown) input.value = shown;
  }, [masked, value]);

  useEffect(() => {
    // A composition that never ended (the input went away mid-way) must not
    // stop the next masked input from handling its edits.
    compositionRef.current = null;
    const input = inputRef.current;
    if (!masked || !input) return;
    const commit = (next: { value: string; caret: number }) => {
      input.value = MASK.repeat(next.value.length);
      input.setSelectionRange(next.caret, next.caret);
      if (next.value !== valueRef.current) onChangeRef.current(next.value);
    };
    const onBeforeInput = (event: InputEvent) => {
      // A composition's own edits can't be cancelled; it is applied at its end.
      if (compositionRef.current || event.isComposing) return;
      event.preventDefault();
      const edit = applyMaskedEdit(valueRef.current, {
        inputType: event.inputType,
        data: event.data ?? event.dataTransfer?.getData('text/plain') ?? null,
        start: input.selectionStart ?? input.value.length,
        end: input.selectionEnd ?? input.value.length,
      });
      if (edit) commit(edit);
    };
    const onCompositionStart = () => {
      compositionRef.current = {
        start: input.selectionStart ?? input.value.length,
        end: input.selectionEnd ?? input.value.length,
      };
    };
    const onCompositionEnd = (event: CompositionEvent) => {
      const range = compositionRef.current;
      compositionRef.current = null;
      if (!range) return;
      // The composed text only; some input methods report mask characters
      // around it, and the key never contains them.
      const edit = applyMaskedEdit(valueRef.current, {
        inputType: 'insertText',
        data: event.data.split(MASK).join(''),
        ...range,
      });
      if (edit) commit(edit);
    };
    // An edit that could not be cancelled (the tail of a composition, in some
    // browsers) must not leave its text showing.
    const onInput = () => {
      if (compositionRef.current) return;
      const shown = MASK.repeat(valueRef.current.length);
      if (input.value === shown) return;
      const caret = Math.min(
        input.selectionStart ?? shown.length,
        shown.length,
      );
      input.value = shown;
      input.setSelectionRange(caret, caret);
    };
    // Dragging would move mask characters in, or out as text.
    const block = (event: Event) => event.preventDefault();
    input.addEventListener('beforeinput', onBeforeInput);
    input.addEventListener('input', onInput);
    input.addEventListener('compositionstart', onCompositionStart);
    input.addEventListener('compositionend', onCompositionEnd);
    input.addEventListener('drop', block);
    input.addEventListener('dragstart', block);
    return () => {
      compositionRef.current = null;
      input.removeEventListener('beforeinput', onBeforeInput);
      input.removeEventListener('input', onInput);
      input.removeEventListener('compositionstart', onCompositionStart);
      input.removeEventListener('compositionend', onCompositionEnd);
      input.removeEventListener('drop', block);
      input.removeEventListener('dragstart', block);
    };
  }, [masked]);

  const shared = {
    ref: inputRef,
    type: 'text',
    autoComplete: 'off',
    'data-1p-ignore': true,
    'data-lpignore': 'true',
    'data-bwignore': true,
    'data-form-type': 'other',
    spellCheck: false,
    autoCapitalize: 'off',
    autoCorrect: 'off',
    ...rest,
  };

  // Keyed by mode, so switching between the uncontrolled and the controlled
  // input mounts a new one rather than turning one into the other.
  return masked ? (
    <Form.Control
      key="masked"
      {...shared}
      defaultValue={MASK.repeat(value.length)}
    />
  ) : (
    <Form.Control
      key="plain"
      {...shared}
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.value)
      }
    />
  );
};
