import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';

import { Breadcrumbs } from './Breadcrumbs';

export const BreadcrumbMain = ({ mobile = false }: { mobile?: boolean }) => {
  const isMd = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.md });

  if (mobile === isMd) {
    return (
      <div
        className={
          'breadcrumb-container d-flex align-items-center flex-grow-1' +
          (mobile ? ' breadcrumb-mobile container' : '')
        }
      >
        <Breadcrumbs />
      </div>
    );
  }
  return null;
};
