import classNames from 'classnames';
import { useContext } from 'react';

import { useBreakpointDown } from 'waldur-ui';

import { LayoutContext } from '@/navigation/context';

import { Breadcrumbs } from './Breadcrumbs';

export const BreadcrumbMain = ({ mobile = false }: { mobile?: boolean }) => {
  const { breadcrumbs } = useContext(LayoutContext);
  const isMd = useBreakpointDown('md');

  if (!breadcrumbs?.length) return null;

  if (mobile === isMd) {
    return (
      <div
        className={classNames(
          'breadcrumb-container d-flex align-items-center flex-grow-1',
          mobile && 'breadcrumb-mobile container-fluid',
        )}
      >
        <Breadcrumbs />
      </div>
    );
  }
  return null;
};
