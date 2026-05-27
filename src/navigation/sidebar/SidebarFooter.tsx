import classNames from 'classnames';

import { AdminMenu } from '@/navigation/sidebar/AdminMenu';
import { SupportMenu } from '@/navigation/sidebar/SupportMenu';
import { useUser } from '@/workspace/hooks';

export const SidebarFooter = ({ menuClassNames }) => {
  const user = useUser();
  const visible = user?.is_staff || user?.is_support;
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
