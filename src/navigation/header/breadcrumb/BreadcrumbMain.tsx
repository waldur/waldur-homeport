import classNames from 'classnames';

import {
  BreadcrumbTrail,
  useBreadcrumbItems,
  useBreakpointDown,
} from 'waldur-ui';

interface BreadcrumbMainProps {
  /** The phone layout: the trail in its own bar under the header. */
  mobile?: boolean;
  /** The impersonation bar is showing above the header. */
  hasPageBar?: boolean;
}

export const BreadcrumbMain = ({
  mobile = false,
  hasPageBar = false,
}: BreadcrumbMainProps) => {
  const breadcrumbs = useBreadcrumbItems();
  const isMd = useBreakpointDown('md');

  if (!breadcrumbs?.length) return null;

  if (mobile === isMd) {
    const trail = (
      <div
        className={classNames(
          'flex items-center grow min-w-0 overflow-hidden',
          mobile && [
            // Below md the trail gets a bar of its own, fixed under the 55px
            // header and as tall, with the header's surface, rule and side
            // padding.
            'fixed inset-x-0 z-20 h-[55px] px-[15px] border-b-[1px] border-b-secondary bg-primary',
            hasPageBar
              ? 'top-[calc(55px+var(--kt-pagebar-height))]'
              : 'top-[55px]',
            // No styles: the hook layout/_toolbar.scss and _sticky-top.scss
            // use to place the page tabs and sticky elements below the bar.
            'breadcrumb-mobile',
          ],
        )}
      >
        <BreadcrumbTrail />
      </div>
    );
    if (!mobile) return trail;
    return (
      <>
        {trail}
        {/* Holds the fixed bar's place in the page flow, so whatever follows
            it — announcements, warning bars, the page — starts below the bar
            instead of underneath it. */}
        <div aria-hidden="true" className="h-[55px] shrink-0" />
      </>
    );
  }
  return null;
};
