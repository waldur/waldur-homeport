import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it("lets a caller's named z-index layer replace a component's own", () => {
    expect(cn('z-50 w-72', 'z-header-popover')).toBe('w-72 z-header-popover');
    expect(cn('z-nav-menu flex', 'z-picker-popover')).toBe(
      'flex z-picker-popover',
    );
  });
});
