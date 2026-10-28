import { useVirtualizer } from '@tanstack/react-virtual';
import { describe, expect, test } from 'vitest';

// Guards the import shape of the virtualization library that drives the
// marketplace popup's offerings list. If a future toolchain change regresses
// the export shape, this test fails at unit-test time.
describe('marketplace-popup virtualization library — module shape', () => {
  test('@tanstack/react-virtual useVirtualizer export is a function', () => {
    expect(typeof useVirtualizer).toBe('function');
  });
});
