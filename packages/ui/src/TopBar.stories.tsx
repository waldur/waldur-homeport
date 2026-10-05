import {
  BellIcon,
  BuildingsIcon,
  PlusIcon,
  QuestionIcon,
  SidebarSimpleIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Menu } from './Menu';
import { Avatar, IconButton, OrgSwitcher, SearchField, TopBar } from './TopBar';

const meta: Meta<typeof TopBar> = {
  title: 'Navigation/TopBar',
  parameters: {
    docs: {
      description: {
        component:
          'New dashboard primitive — OrgSwitcher is the waldur-ui Menu and IconButton pairs with the Tooltip primitive (see TopBar.tsx); SearchField stays presentational, no real search wiring.',
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
            <Menu.Label>Organisations</Menu.Label>
            {/* The current organisation is highlighted, as the main app's
                current row; no check mark. */}
            <Menu.RadioGroup value="nordfusion">
              <Menu.RadioItem value="nordfusion">
                <BuildingsIcon size={16} weight="bold" className="me-[13px]" />
                NordFusion Biotech
              </Menu.RadioItem>
              <Menu.RadioItem value="acme">
                <BuildingsIcon size={16} weight="bold" className="me-[13px]" />
                Acme Cloud Research
              </Menu.RadioItem>
            </Menu.RadioGroup>
            <Menu.Separator />
            <Menu.Item icon={<PlusIcon weight="bold" />}>
              Add organisation
            </Menu.Item>
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
