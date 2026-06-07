import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { describe, expect, test } from 'vitest';

// Guards the import shape of the two libraries that drive the marketplace
// popup's offerings list. We just swapped off `react-window-paginated`
// (dead since 2018, pure CJS, broke under Vite 8 / Rolldown). If a future
// toolchain change regresses the default-import unwrap or the named
// export, this test fails at unit-test time instead of letting the
// regression surface as a runtime `paginate is not a function` (or similar)
// on the live "Add Resource" popup. Same pattern as react-flatpickr-shape.test.ts.
describe('marketplace-popup pagination libraries — module shape', () => {
  test('react-window-infinite-loader default export is a class component', () => {
    expect(typeof InfiniteLoader).toBe('function');
  });

  test('react-window FixedSizeList named export is a class component', () => {
    expect(typeof FixedSizeList).toBe('function');
  });
});
