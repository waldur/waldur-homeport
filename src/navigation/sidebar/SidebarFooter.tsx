import { AdminMenu } from '@waldur/navigation/sidebar/AdminMenu';
import { SupportMenu } from '@waldur/navigation/sidebar/SupportMenu';

export const SidebarFooter = () => (
  <div className="aside-footer flex-column-auto" id="kt_aside_footer">
    <div className="aside-menu menu menu-column border-top">
      <SupportMenu />
      <AdminMenu />
    </div>
  </div>
);
