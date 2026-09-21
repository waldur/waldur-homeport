import { useLayoutEffect, useState } from 'react';

import { getCssVar } from './cssVar';

/**
 * Resolved value of a custom property on <html>, as a React state. Re-read when
 * <html>'s style or data-theme changes, because the brand ramp is written
 * there at runtime (initBrandTokens), after the first render, and a theme flip
 * can change a variable. Empty until the first read.
 *
 * Its own entry point (`waldur-design-tokens/react`) so the main entry stays
 * free of React.
 */
export function useResolvedVar(cssVar: string): string {
  const [value, setValue] = useState('');
  useLayoutEffect(() => {
    const read = () => setValue(getCssVar(cssVar));
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-theme'],
    });
    return () => observer.disconnect();
  }, [cssVar]);
  return value;
}
