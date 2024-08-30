import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { AdminMenu } from '@waldur/navigation/sidebar/AdminMenu';
import { SupportMenu } from '@waldur/navigation/sidebar/SupportMenu';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

export const SidebarFooter = ({ menuClassNames }) => {
  const visible = useSelector(isStaffOrSupport);
  if (!visible) {
    return null;
  }
  return (
    <div
      className="aside-footer has-divider flex-column-auto pb-4"
      id="kt_aside_footer"
    >
      <div
        className={classNames(
          'aside-menu menu menu-column menu-rounded gap-1 fs-4 fw-bold pt-4',
          menuClassNames,
        )}
      >
        <SupportMenu />
        <AdminMenu />
      </div>
    </div>
  );
};
