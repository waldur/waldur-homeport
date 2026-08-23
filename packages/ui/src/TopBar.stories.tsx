import {
  BellIcon,
  BuildingsIcon,
  CheckIcon,
  PlusIcon,
  QuestionIcon,
  SidebarSimpleIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './DropdownMenu';
import { Avatar, IconButton, OrgSwitcher, SearchField, TopBar } from './TopBar';

const meta: Meta<typeof TopBar> = {
  title: 'Dashboard/TopBar',
  parameters: {
    docs: {
      description: {
        component:
          'New dashboard primitive — OrgSwitcher is a real Radix DropdownMenu and IconButton pairs with the Tooltip primitive (see TopBar.tsx); SearchField stays presentational, no real search wiring.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof TopBar>;

/** Roughly the mockup's top bar. */
export const OrganisationAdminExample: Story = {
  render: () => (
    <TopBar
      left={
        <>
          <IconButton
            icon={<SidebarSimpleIcon size={18} weight="bold" />}
            label="Toggle sidebar"
          />
          <OrgSwitcher badge="NO" name="NordFusion Biotech">
            <DropdownMenuLabel>Organisations</DropdownMenuLabel>
            <DropdownMenuItem>
              <CheckIcon size={16} weight="bold" />
              NordFusion Biotech
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BuildingsIcon size={16} weight="bold" />
              Acme Cloud Research
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <PlusIcon size={16} weight="bold" />
              Add organisation
            </DropdownMenuItem>
          </OrgSwitcher>
        </>
      }
      center={<SearchField placeholder="Search" shortcutHint="⌘K" />}
      right={
        <>
          <IconButton
            icon={<SquaresFourIcon size={18} weight="bold" />}
            label="Apps"
          />
          <IconButton
            icon={<QuestionIcon size={18} weight="bold" />}
            label="Help"
          />
          <IconButton
            icon={<BellIcon size={18} weight="bold" />}
            label="Notifications"
            hasIndicator
          />
          <Avatar initials="MS" />
        </>
      }
    />
  ),
};
