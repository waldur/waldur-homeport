import {
  CardsThreeIcon,
  CoinsIcon,
  FileTextIcon,
  GearIcon,
  HandCoinsIcon,
  IdentificationCardIcon,
  ReceiptIcon,
  SquaresFourIcon,
  UsersThreeIcon,
  WrenchIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Sidebar,
  SidebarBrand,
  SidebarContent,
  SidebarHeader,
  SidebarModeCard,
  SidebarNavItem,
  SidebarProvider,
  SidebarSection,
} from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Dashboard/Sidebar',
  parameters: {
    docs: {
      description: {
        component:
          "shadcn Sidebar recipe (collapsible, mobile Sheet, Cmd/Ctrl+B shortcut) — see Sidebar.tsx. SidebarBrand/SidebarNavItem/SidebarSection/SidebarModeCard are this app's own convenience layer, generic (not hardcoded to one mode).",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

const WaldurMark = () => (
  <span className="flex items-center gap-2 text-2xl leading-none font-bold tracking-wide">
    <svg viewBox="0 10 10 10.02" width="20" height="20" fill="currentColor">
      <path d="m 2,10.04 v 7.98 h 1.98 v 2 H 0 v -9.98 z m 7.96,0 v 9.98 H 5.98 v -2 h 1.98 v -7.98 z m -3.98,3.98 v 4 h -2 v -4 z" />
    </svg>
    WALDUR
  </span>
);

/** Reconstructs the mockup's "Finance & reporting" mode nav as one example configuration. */
export const FinanceReportingExample: Story = {
  render: () => (
    <SidebarProvider className="h-[600px]">
      <Sidebar>
        <SidebarHeader className="gap-4">
          <SidebarBrand logo={<WaldurMark />} />
          <SidebarModeCard
            icon={<IdentificationCardIcon size={22} weight="bold" />}
            title="Finance & reporting"
            subtitle="Invoices, cost analytics"
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarSection>
            <SidebarNavItem
              icon={<SquaresFourIcon size={20} weight="bold" />}
              label="Overview"
              active
            />
          </SidebarSection>
          <SidebarSection label="FINANCE">
            <SidebarNavItem
              icon={<HandCoinsIcon size={20} weight="bold" />}
              label="Revenue"
            />
            <SidebarNavItem
              icon={<CoinsIcon size={20} weight="bold" />}
              label="Costs"
            />
            <SidebarNavItem
              icon={<ReceiptIcon size={20} weight="bold" />}
              label="Pricelist"
            />
          </SidebarSection>
          <SidebarSection label="REPORTS">
            <SidebarNavItem
              icon={<CardsThreeIcon size={20} weight="bold" />}
              label="Resources"
            />
            <SidebarNavItem
              icon={<WrenchIcon size={20} weight="bold" />}
              label="Providers"
            />
            <SidebarNavItem
              icon={<UsersThreeIcon size={20} weight="bold" />}
              label="Users"
            />
            <SidebarNavItem
              icon={<GearIcon size={20} weight="bold" />}
              label="Operations"
            />
            <SidebarNavItem
              icon={<FileTextIcon size={20} weight="bold" />}
              label="Proposals"
            />
          </SidebarSection>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
};
