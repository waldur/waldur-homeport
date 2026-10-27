import {
  BellIcon,
  BuildingsIcon,
  ChatsCircleIcon,
  ListIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  QuestionIcon,
  SidebarSimpleIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Menu } from '../Menu';

import { Avatar, IconButton, OrgSwitcher, SearchField, TopBar } from './TopBar';

const meta: Meta<typeof TopBar> = {
  title: 'Navigation/TopBar',
  parameters: {
    docs: {
      description: {
        component:
          'The app header bar (see TopBar.tsx); OrgSwitcher is the waldur-ui Menu and IconButton pairs with the Tooltip primitive (see TopBar.tsx); SearchField stays presentational, no real search wiring.',
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
      center={
        <div className="flex w-full items-center justify-center">
          <SearchField placeholder="Search" shortcutHint="⌘K" />
        </div>
      }
      right={
        <div className="flex items-center gap-1.5">
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
        </div>
      }
    />
  ),
};

/**
 * The app header's own layout (src/navigation/header/AppHeader.tsx) with
 * stand-ins for its data-bound parts. e2e-visual/top-bar-geometry.spec.ts
 * measures it against the geometry the Metronic header had, so keep the
 * classes here the same as AppHeader's.
 */
export const AppHeaderLayout: Story = {
  render: () => (
    <TopBar
      data-testid="top-bar"
      left={
        <div className="flex items-center lg:hidden -ms-[0.5rem] me-[0.5rem]">
          <IconButton
            data-testid="nav-toggle"
            label="Toggle navigation menu"
            icon={<ListIcon weight="bold" />}
            iconSize="lg"
            className="me-[0.25rem]"
          />
          <span className="block h-[30px] w-[46px] bg-tertiary" />
        </div>
      }
      center={
        <span data-testid="crumbs" className="self-center text-sm">
          Organizations / 10xVentures OÜ
        </span>
      }
      right={
        <>
          {/* The search toggle's wrapper has no margin; the drawer toggles'
              do (AppHeader, SearchToggle, *DrawerToggle). */}
          <div className="flex items-center">
            <IconButton
              data-testid="search"
              label="Search"
              icon={<MagnifyingGlassIcon weight="bold" />}
            />
          </div>
          <div className="flex items-center ms-[0.25rem]">
            <IconButton
              data-testid="support"
              label="Support"
              icon={<ChatsCircleIcon weight="bold" />}
            />
          </div>
          <div className="flex items-center ms-[0.25rem]">
            <IconButton
              data-testid="pending"
              label="Pending tasks"
              icon={<BellIcon weight="bold" />}
            />
          </div>
          <span
            data-testid="divider"
            className="h-[40px] border-r-[1px] border-r-secondary self-center ms-[0.25rem] lg:hidden"
          />
          <div className="flex items-center ms-[0.75rem]">
            <span
              data-testid="user"
              className="block size-[40px] rounded-full bg-tertiary"
            />
          </div>
        </>
      }
    />
  ),
};
