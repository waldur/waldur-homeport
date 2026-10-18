import { ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { FieldContext } from './controlId';

export interface FieldScopeProps {
  /** A fixed id for the control inside; see `FormField`. */
  controlId?: string;
  /** A fieldset: see `FormFieldset`. */
  group?: boolean;
  children: ReactNode;
}

/**
 * The ids that are mounted now, in the order they registered, and the call
 * that adds one. `add` returns the call that removes it again, which is what a
 * layout effect's cleanup wants. Kept in state so the label and the controls
 * re-render when the list changes.
 */
const useIdList = () => {
  const [ids, setIds] = useState<string[]>([]);
  const add = useCallback((id: string) => {
    setIds((current) => (current.includes(id) ? current : [...current, id]));
    return () => setIds((current) => current.filter((other) => other !== id));
  }, []);
  return [ids, add] as const;
};

/**
 * The linking half of `FormField`, with no element of its own: controls inside
 * register with it and the labels inside point at the first. For a label and
 * its control that cannot share a wrapper, such as the two cells of a table
 * row (`FormTable.Item`). Draw the label with `FormLabel`, or read the target
 * with `useFieldLabelFor` for a label of your own.
 */
export const FieldScope = ({ controlId, group, children }: FieldScopeProps) => {
  // The controls: the label follows the earliest, and moves to the next when
  // that one goes. The help and error text: the controls point at all of them.
  const [controls, register] = useIdList();
  const [descriptions, describe] = useIdList();
  // Primitives, so a control joining a field that already has one does not
  // hand every consumer a new context value.
  const first = controls[0];
  const describedBy = descriptions.join(' ') || undefined;
  const value = useMemo(
    () => ({
      controlId,
      labelFor: group ? undefined : (first ?? controlId),
      group,
      register,
      describedBy,
      describe,
    }),
    [controlId, group, first, register, describedBy, describe],
  );
  return (
    <FieldContext.Provider value={value}>{children}</FieldContext.Provider>
  );
};

/**
 * What a label should point at: an explicit `htmlFor` if given, else the
 * enclosing field's (or scope's) control. For a custom `<label>`; `FormLabel`
 * does this itself.
 */
export const useFieldLabelFor = (htmlFor?: string) => {
  const field = useContext(FieldContext);
  return htmlFor ?? field?.labelFor;
};
