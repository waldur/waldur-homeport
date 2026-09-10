import React from 'react';
import { vi } from 'vitest';

// Every icon is replaced by a <span>, so the real package is never needed.
// Loading it with importOriginal() evaluated all of its icon modules in every
// test file and was the single largest import cost of the unit suite.
vi.mock('@phosphor-icons/react', () => {
  const actual = { IconContext: React.createContext({}) };
  const cache = {};
  return new Proxy(actual, {
    // Vitest checks named exports with `in` before reading them.
    has: () => true,
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
