import { FC, HTMLAttributes } from 'react';

import { cn } from './cn';

export interface WaldurLogoProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

/**
 * The Waldur wordmark for the sidebar's brand row — the mark's own path
 * from waldur-homeport's src/images/logo_w.svg (the white variant it serves
 * on dark asides), exported as a component so micro-apps and packages
 * don't need to duplicate SVG code or reach into root's src/images/.
 *
 * Both parts inherit currentColor from SidebarBrand's --nav-item-text, so
 * the wordmark tracks whatever SIDEBAR_STYLE is configured instead of
 * hardcoding white.
 */
export const WaldurLogo: FC<WaldurLogoProps> = ({ className, ...props }) => (
  <span
    className={cn(
      'flex items-center gap-2 text-2xl font-bold tracking-wide leading-none',
      className,
    )}
    {...props}
  >
    <svg
      viewBox="0 10 10 10.02"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m 2,10.04 v 7.98 h 1.98 v 2 H 0 v -9.98 z m 7.96,0 v 9.98 H 5.98 v -2 h 1.98 v -7.98 z m -3.98,3.98 v 4 h -2 v -4 z" />
    </svg>
    WALDUR
  </span>
);
