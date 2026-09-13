import { PropsWithChildren } from 'react';

import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from 'waldur-ui';

import { SidebarFooter } from './SidebarFooter';
import { useSidebarLayoutShim } from './useSidebarLayoutShim';
import { WaldurSidebarBrand } from './WaldurSidebarBrand';

const SidebarBrandHeader = ({ onToggle }: { onToggle: () => void }) => {
  // Metronic's original mobile drawer (.drawer-mobile) never had its own
  // logo/toggle row at all — the app's persistent TopBar (hamburger + logo,
  // rendered *outside* this drawer) already carries the brand, so duplicating
  // it inside would be redundant. Confirmed live: the real mobile drawer
  // starts directly with "Add resource", no header above it. isMobile comes
  // from the same useSidebar() context SidebarMenuButton already reads for its
  // own mobile-vs-desktop branching.
  const { isMobile } = useSidebar();
  if (isMobile) {
    return null;
  }
  return (
    <SidebarHeader className="gap-4">
      <WaldurSidebarBrand onToggle={onToggle} />
    </SidebarHeader>
  );
};

export const Sidebar: React.FC<PropsWithChildren> = ({ children }) => {
  // Mobile drawer/overlay, Escape-to-close and body-scroll-lock all live in
  // waldur-ui's Sidebar mobile branch now (a Radix Sheet, whose underlying
  // Dialog primitives already provide all three) — nothing left to do here
  // for that. The shim mirrors this sidebar's real state into homeport's
  // own Metronic layout config for AppHeader/Toolbar/LLMChatDrawer's sake;
  // see its own doc comment for why that's still needed.
  const { markUserToggled } = useSidebarLayoutShim();

  return (
    <SidebarRoot>
      <SidebarBrandHeader onToggle={markUserToggled} />
      <SidebarContent>
        <SidebarMenu>{children}</SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </SidebarRoot>
  );
};
