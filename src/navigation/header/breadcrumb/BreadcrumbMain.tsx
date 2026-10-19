import classNames from 'classnames';

import {
  BreadcrumbTrail,
  useBreadcrumbItems,
  useBreakpointDown,
} from 'waldur-ui';

export const BreadcrumbMain = ({ mobile = false }: { mobile?: boolean }) => {
  const breadcrumbs = useBreadcrumbItems();
  const isMd = useBreakpointDown('md');

  if (!breadcrumbs?.length) return null;

  if (mobile === isMd) {
    return (
      <div
        className={classNames(
          'flex items-center grow min-w-0 overflow-hidden',
          mobile && 'breadcrumb-mobile container-fluid',
        )}
      >
        <BreadcrumbTrail />
      </div>
    );
  }
  return null;
};
