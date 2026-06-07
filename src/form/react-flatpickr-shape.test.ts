import * as RFP from 'react-flatpickr';
import Flatpickr, { type DateTimePickerHandle } from 'react-flatpickr';
import { describe, expect, test } from 'vitest';

// Guards the upgrade from CJS-only react-flatpickr@3 to dual ESM/CJS @4.
// Under the old shape, `Flatpickr` would resolve to the namespace object
// under Vite 8 / Rolldown and JSX `<Flatpickr/>` would throw React #130.
// These assertions break loudly if a future bump regresses the shape.
describe('react-flatpickr module shape', () => {
  test('default export resolves to a function component', () => {
    expect(typeof Flatpickr).toBe('function');
    expect(typeof RFP.default).toBe('function');
    expect(RFP.default).toBe(Flatpickr);
  });

  test('exports DateTimePickerHandle as a type (compile-time check)', () => {
    // The presence of this annotation forces tsc to resolve the type. If
    // the type export is dropped from a future release, this file fails
    // to type-check.
    const _handle: DateTimePickerHandle | undefined = undefined;
    expect(_handle).toBeUndefined();
  });
});
