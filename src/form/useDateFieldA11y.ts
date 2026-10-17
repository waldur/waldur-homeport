import { useCallback, useEffect, useRef } from 'react';
import { FieldMetaState, useForm } from 'react-final-form';

import { useFormGroupA11y } from './FormGroup';

/**
 * The surrounding react-final-form form, or `undefined` outside one: table
 * filters drive the same adapters from Redux. `useForm` reads its context
 * unconditionally and only then throws, so catching keeps hook order stable.
 */
const useOptionalForm = () => {
  try {
    return useForm();
  } catch {
    return undefined;
  }
};

/**
 * ARIA for a date picker inside a FormGroup: invalid while the form shows
 * an error for it, described by the group's description and error, and —
 * for the range picker's group of two inputs — labelled by its label.
 * `onEntryErrorChange` goes to the picker, so the group holds back its own
 * error while the picker shows one for a refused entry.
 *
 * A refused entry also fails the field's validation while it is shown.
 * Refusing it empties the value, and without this an optional field would
 * submit that empty value — clearing a date the user meant to change.
 */
export const useDateFieldA11y = (
  meta?: Partial<FieldMetaState<any>>,
  isInvalid?: boolean,
  name?: string,
) => {
  const { labelId, descriptionId, errorId, setControlError } =
    useFormGroupA11y();
  const form = useOptionalForm();
  const invalid = !!errorId || !!isInvalid || !!(meta?.touched && meta?.error);
  useEffect(() => () => setControlError?.(false), [setControlError]);

  // Registering a validator runs validation at once, so the form is already
  // invalid when the click on Save that blurred the input lands. The new
  // one goes in before the old one comes out: final-form skips validation
  // entirely once a form has no validators left, keeping a stale error.
  const registration = useRef<() => void>(undefined);
  const validateEntry = useCallback(
    (message: string | null) => {
      if (!form || !name) return;
      const previous = registration.current;
      registration.current = form.registerField(
        name,
        () => undefined,
        {},
        { getValidator: () => () => message ?? undefined },
      );
      previous?.();
    },
    [form, name],
  );
  useEffect(
    () => () => {
      registration.current?.();
      registration.current = undefined;
    },
    [validateEntry],
  );

  const onEntryErrorChange = useCallback(
    (message: string | null) => {
      validateEntry(message);
      setControlError?.(!!message);
    },
    [validateEntry, setControlError],
  );
  return {
    labelId,
    onEntryErrorChange,
    ariaProps: {
      'aria-invalid': invalid || undefined,
      'aria-describedby':
        [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
    },
  };
};
