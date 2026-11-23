import { FC, ReactNode } from 'react';

/**
 * A box that scrolls sideways when its drawing is wider than the page. It
 * takes keyboard focus so the arrow keys can scroll it (WCAG 2.1.1): a
 * drawing has nothing else to focus inside it. Named, so a screen reader
 * says what the stop is.
 */
export const ScrollRegion: FC<{
  label: string;
  className?: string;
  children: ReactNode;
}> = ({ label, className, children }) => (
  <div
    className={className}
    role="region"
    aria-label={label}
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    tabIndex={0}
  >
    {children}
  </div>
);
