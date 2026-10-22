import classNames from 'classnames';
import { forwardRef } from 'react';

import {
  BreadcrumbTrail,
  useBreadcrumbItems,
  useBreakpointDown,
} from 'waldur-ui';

interface BreadcrumbMainProps {
  /** The phone layout: the trail in its own bar under the header. */
  mobile?: boolean;
}

export const BreadcrumbMain = forwardRef<HTMLDivElement, BreadcrumbMainProps>(
  ({ mobile = false }, ref) => {
    const breadcrumbs = useBreadcrumbItems();
    const isMd = useBreakpointDown('md');

    if (!breadcrumbs?.length) return null;

    if (mobile === isMd) {
      return (
        <div
          ref={ref}
          className={classNames(
            'flex items-center min-w-0 overflow-hidden',
            // In the header the trail takes the free width; the phone bar
            // sits in the page's flex column and keeps its own height.
            mobile ? 'shrink-0' : 'grow',
            // Below md the trail gets a bar of its own under the header, as
            // tall, with the header's surface, rule and side padding. It
            // sticks under the header on its own, below the drawer layer, so
            // a floating drawer, which hangs from the header, covers it.
            // mt-px undoes the header group's -mb-px: the bar starts under
            // the header's rule; -mb-px lets what follows start under its own.
            mobile && [
              'h-[55px] px-[15px] border-b-[1px] border-b-secondary bg-primary',
              'sticky z-99 mt-px -mb-px print:hidden',
              'top-[calc(var(--layout-page-bar-height,0px)+var(--layout-header-height,0px))]',
            ],
          )}
        >
          <BreadcrumbTrail />
        </div>
      );
    }
    return null;
  },
);
BreadcrumbMain.displayName = 'BreadcrumbMain';
