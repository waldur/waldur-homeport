import { useEffect, useRef } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { cleanInternalName } from './internalName';

interface InternalNamePrefillProps {
  // Display-name field to derive the internal name from.
  source: string;
  // Internal-name field to fill.
  target: string;
  disabled?: boolean;
}

// Auto-fills the internal-name field from the display name while the user has
// not edited it by hand: it keeps writing as long as the target is empty or
// still equals the last value we generated. It only reacts to display-name
// changes, so clearing or editing the internal name by hand is left untouched
// (and stops further auto-fill). Renders nothing.
export const InternalNamePrefill = ({
  source,
  target,
  disabled,
}: InternalNamePrefillProps) => {
  const form = useForm();
  const { values } = useFormState({ subscription: { values: true } });
  const lastGenerated = useRef<string | undefined>(undefined);

  const sourceValue = values[source];
  const targetValue = values[target];
  const previousSource = useRef(sourceValue);

  useEffect(() => {
    // Only respond to display-name edits, never to internal-name edits.
    if (sourceValue === previousSource.current) {
      return;
    }
    previousSource.current = sourceValue;
    if (disabled) {
      return;
    }
    const cleaned = cleanInternalName(sourceValue);
    const untouched = !targetValue || targetValue === lastGenerated.current;
    if (untouched && cleaned !== targetValue) {
      lastGenerated.current = cleaned;
      form.change(target, cleaned);
    }
  }, [form, target, disabled, sourceValue, targetValue]);

  return null;
};
