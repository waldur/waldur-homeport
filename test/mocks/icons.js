import React from 'react';
import { vi } from 'vitest';

vi.mock('@phosphor-icons/react', async (importOriginal) => {
  const actual = await importOriginal();
  const cache = {};
  return new Proxy(actual, {
    get: (target, prop) => {
      // Don't mock non-component properties like IconContext
      if (
        prop === 'IconContext' ||
        prop === '__esModule' ||
        prop === 'default'
      ) {
        return target[prop];
      }

      if (cache[prop]) {
        return cache[prop];
      }

      const Component = React.forwardRef((props, ref) =>
        React.createElement('span', {
          ...props,
          ref,
          'data-testid': String(prop),
        }),
      );
      Component.displayName = String(prop);
      cache[prop] = Component;
      return Component;
    },
  });
});
