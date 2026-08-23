import {
  BuildingsIcon,
  FolderIcon,
  GaugeIcon,
  GearIcon,
  ListBulletsIcon,
  ReceiptIcon,
  SquaresFourIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Sidebar,
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
          "shadcn Sidebar recipe (collapsible, mobile Sheet, Cmd/Ctrl+B shortcut) — see Sidebar.tsx. SidebarNavItem/SidebarSection/SidebarModeCard are this app's own convenience layer, generic (not hardcoded to one mode).",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

/** Reconstructs the mockup's "Organisation admin" mode nav as one example configuration. */
export const OrganisationAdminExample: Story = {
  render: () => (
    <SidebarProvider className="h-[600px]">
      <Sidebar>
        <SidebarHeader>
          <SidebarModeCard
            eyebrow="CURRENT MODE"
            icon={<BuildingsIcon size={18} weight="bold" />}
            title="Organisation admin"
            subtitle="Projects, members, invoices"
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarSection label="ORGANISATION">
            <SidebarNavItem
              icon={<SquaresFourIcon size={16} weight="bold" />}
              label="Overview"
            />
            <SidebarNavItem
              icon={<FolderIcon size={16} weight="bold" />}
              label="Projects"
              count={12}
            />
            <SidebarNavItem
              icon={<UsersIcon size={16} weight="bold" />}
              label="Members"
              active
            />
          </SidebarSection>
          <SidebarSection label="FINANCE">
            <SidebarNavItem
              icon={<ReceiptIcon size={16} weight="bold" />}
              label="Invoices"
            />
            <SidebarNavItem
              icon={<GaugeIcon size={16} weight="bold" />}
              label="Quotas"
            />
          </SidebarSection>
          <SidebarSection label="ADMIN">
            <SidebarNavItem
              icon={<GearIcon size={16} weight="bold" />}
              label="Settings"
            />
            <SidebarNavItem
              icon={<ListBulletsIcon size={16} weight="bold" />}
              label="Audit log"
            />
          </SidebarSection>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
};
