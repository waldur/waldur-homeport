import { createContext, useContext, useId, useLayoutEffect } from 'react';

export interface FieldContextValue {
  /**
   * What the label points at: the first control to register (so a control
   * with an id of its own is the one named), else the explicit `controlId`.
   */
  labelFor?: string;
  /** Set when the field was given a `controlId`: every control inside takes it. */
  controlId?: string;
  /** A control tells the field its id; returns the call that withdraws it. */
  register: (id: string) => () => void;
  /**
   * Set for a fieldset: it holds several controls, named by a legend rather
   * than a label, so none of them takes the label's id or the group's help
   * text (the fieldset itself carries that).
   */
  group?: boolean;
  /** The ids of the help and error text in the field, for `aria-describedby`. */
  describedBy?: string;
  /** A piece of help or error text tells the field its id; returns the call
   * that withdraws it. */
  describe: (id: string) => () => void;
}

/**
 * Tells a field's controls and its label about each other. Input, Textarea,
 * NativeSelect (and so NumberInput and SecretInput), the date pickers and
 * Select read it through `useControlId`, which is how a label names its
 * control without an id being written twice.
 */
export const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * The id for a control. An explicit `id` wins; then the enclosing field's
 * `controlId`; otherwise, inside a field, an id of the control's own that the
 * field's label then points at (the first control to mount, if there are
 * several, so every control keeps a unique id). Outside a field a control has
 * no id unless it is given one.
 */
export const useControlId = (id?: string) => {
  const field = useContext(FieldContext);
  const own = useId();
  const resolved = id ?? field?.controlId ?? (field ? own : undefined);
  const register = field?.register;
  useLayoutEffect(
    () => (register && resolved ? register(resolved) : undefined),
    [register, resolved],
  );
  return resolved;
};

/**
 * The `aria-describedby` for a control: its own, if it has one, then the help
 * and error text of the enclosing field, so a screen reader announces them
 * with the control.
 */
export const useDescribedBy = (own?: string) => {
  const field = useContext(FieldContext);
  // A control that already points at one of the field's texts by hand must not
  // list it twice: a screen reader would read it twice.
  const ids =
    `${own ?? ''} ${field?.group ? '' : (field?.describedBy ?? '')}`.split(
      /\s+/,
    );
  return [...new Set(ids.filter(Boolean))].join(' ') || undefined;
};

/**
 * The id for a piece of help or error text, registered with the enclosing
 * field so its controls point at it. An explicit `id` wins.
 */
export const useDescriptionId = (id?: string) => {
  const field = useContext(FieldContext);
  const own = useId();
  const resolved = id ?? own;
  const describe = field?.describe;
  useLayoutEffect(
    () => (describe ? describe(resolved) : undefined),
    [describe, resolved],
  );
  return resolved;
};
