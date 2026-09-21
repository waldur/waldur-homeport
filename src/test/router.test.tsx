import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createTestRouter } from './router';

// test/mocks/router.js replaces <UIRouter> with a passthrough for every unit
// test, so start() would never be called — load the real component instead.
const { UIRouter } =
  await vi.importActual<typeof import('@uirouter/react')>('@uirouter/react');

describe('createTestRouter', () => {
  it('returns an independent router on every call', () => {
    expect(createTestRouter()).not.toBe(createTestRouter());
  });

  it('is started by <UIRouter>', () => {
    const router = createTestRouter();
    expect(router.started).toBe(false);

    const { unmount } = render(<UIRouter router={router}>content</UIRouter>);
    expect(router.started).toBe(true);

    unmount();
  });

  // Regression guard for the Storybook preview: <UIRouter> calls start() on
  // mount and start() throws when called twice, so a router must never be
  // shared across mounts — each mount takes a fresh one instead.
  it('supports remounting <UIRouter> when each mount gets a fresh router', () => {
    for (let mount = 0; mount < 3; mount++) {
      const router = createTestRouter();
      const { unmount } = render(<UIRouter router={router}>content</UIRouter>);
      expect(router.started).toBe(true);
      unmount();
      router.dispose();
    }
  });

  it('documents why a router cannot be shared between mounts', () => {
    const router = createTestRouter();
    render(<UIRouter router={router}>content</UIRouter>).unmount();

    // If this stops throwing after an @uirouter/react upgrade, the fresh-
    // router-per-mount workaround in .storybook/preview.tsx can be dropped.
    expect(() => render(<UIRouter router={router}>content</UIRouter>)).toThrow(
      /start\(\) method has been called more than once/,
    );
  });
});
