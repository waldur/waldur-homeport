import {
  SidebarFooter as SidebarFooterSlot,
  SidebarMenu,
  SidebarSeparator,
} from 'waldur-ui';

import { useUser } from '@/workspace/hooks';

import { AdminMenu } from './AdminMenu';
import { SupportMenu } from './SupportMenu';

export const SidebarFooter = () => {
  const user = useUser();
  const visible = user?.is_staff || user?.is_support;
  if (!visible) {
    return null;
  }
  return (
    <SidebarFooterSlot className="gap-2">
      <SidebarSeparator className="mx-0" />
      <SidebarMenu>
        <SupportMenu />
        <AdminMenu />
      </SidebarMenu>
    </SidebarFooterSlot>
  );
};
