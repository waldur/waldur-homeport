import React from 'react';
import { vi } from 'vitest';

vi.mock('@phosphor-icons/react', async (importOriginal) => {
  const actual = await importOriginal();
  return new Proxy(actual, {
    get: (target, prop) => {
      if (prop in target && prop !== 'default') {
        return target[prop];
      }
      const Component = React.forwardRef((props, ref) =>
        React.createElement('span', {
          ...props,
          ref,
          'data-testid': `icon-${String(prop)}`,
        }),
      );
      Component.displayName = String(prop);
      return Component;
    },
  });
});
