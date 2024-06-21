import { useSelector } from 'react-redux';

import { AdminMenu } from '@waldur/navigation/sidebar/AdminMenu';
import { SupportMenu } from '@waldur/navigation/sidebar/SupportMenu';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

export const SidebarFooter = () => {
  const visible = useSelector(isStaffOrSupport);
  if (!visible) {
    return null;
  }
  return (
    <div className="aside-footer flex-column-auto pb-4" id="kt_aside_footer">
      <div className="aside-menu menu menu-column border-top pt-4">
        <SupportMenu />
        <AdminMenu />
      </div>
    </div>
  );
};
