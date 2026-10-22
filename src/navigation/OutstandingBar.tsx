import { forwardRef, PropsWithChildren } from 'react';

export const OutstandingBar = forwardRef<HTMLDivElement, PropsWithChildren>(
  ({ children }, ref) => (
    // Sticks to the top of the page, above sticky page content (z-95) and
    // one above the header, so anything opening down from the bar isn't
    // hidden behind it.
    <div
      ref={ref}
      className="sticky top-0 w-full h-[64px] shrink-0 z-101 print:hidden"
    >
      {children}
    </div>
  ),
);
OutstandingBar.displayName = 'OutstandingBar';
