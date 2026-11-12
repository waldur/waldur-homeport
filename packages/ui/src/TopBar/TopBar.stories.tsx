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
import { expect } from 'storybook/test';

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
 * stand-ins for its data-bound parts. Its play function (and the
 * AppHeaderGeometry* stories below) pin it to the geometry the Metronic
 * header had, so keep the classes here the same as AppHeader's.
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
            className="h-[40px] border-r border-r-secondary self-center ms-[0.25rem] lg:hidden"
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
  globals: { viewport: { value: 'widescreen' } },
  play: ({ canvasElement }) => checkAppHeaderGeometry(canvasElement),
};

/*
 * Geometry of AppHeaderLayout, pinned to what the Metronic header had now that
 * its stylesheets (layout/_header.scss, custom/_nav.scss) are gone and there is
 * nothing left to diff against. Every number was measured on the legacy header
 * in the signed-in app, at the 13px desktop root and the 12px mobile one: the
 * spacing is rem-based, so it differs between the two. The Vitest runner sizes
 * the page from `globals.viewport`, so each layout and theme is its own story.
 */

const TOLERANCE = 0.3;

const LAYOUTS = {
  desktop: {
    height: 65,
    padding: 32,
    // ms-[0.25rem] / ms-[0.75rem] at a 13px root.
    gap: 3.25,
    userGap: 9.75,
  },
  mobile: {
    height: 55,
    padding: 15,
    gap: 3,
    userGap: 9,
  },
} as const;

const near = (actual: number, expected: number, what: string) =>
  expect(
    Math.abs(actual - expected),
    `${what}: ${actual} vs ${expected}`,
  ).toBeLessThanOrEqual(TOLERANCE);

/** The colour a token resolves to, read through a probe element. */
const tokenColor = (name: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${name})`;
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

async function checkAppHeaderGeometry(canvasElement: HTMLElement) {
  const byId = (testId: string) => {
    const el = canvasElement.querySelector<HTMLElement>(
      `[data-testid="${testId}"]`,
    );
    if (!el) throw new Error(`${testId} is not rendered`);
    return el;
  };
  const box = (testId: string) => byId(testId).getBoundingClientRect();

  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  const layout = isDesktop ? LAYOUTS.desktop : LAYOUTS.mobile;

  // The bar.
  const barEl = byId('top-bar');
  const bar = barEl.getBoundingClientRect();
  const cs = getComputedStyle(barEl);
  const border = parseFloat(cs.borderBottomWidth);
  near(bar.height, layout.height, 'height');
  near(parseFloat(cs.paddingLeft), layout.padding, 'padding-left');
  near(parseFloat(cs.paddingRight), layout.padding, 'padding-right');
  await expect(border).toBeGreaterThan(0);
  await expect(`${cs.borderBottomStyle} ${cs.borderBottomColor}`).toBe(
    `solid ${tokenColor('--border-secondary')}`,
  );
  await expect(cs.backgroundColor).toBe(tokenColor('--bg-primary'));

  // The actions.
  const search = box('search');
  const support = box('support');
  const pending = box('pending');
  const user = box('user');
  for (const [id, b] of Object.entries({ search, support, pending })) {
    near(b.width, 40, `${id} width`);
    near(b.height, 40, `${id} height`);
    // Centred in the bar above its bottom rule.
    near(b.y - bar.y, (layout.height - border - 40) / 2, `${id} top`);
  }
  near(support.x - search.right, layout.gap, 'search → support');
  near(pending.x - support.right, layout.gap, 'support → pending');
  near(user.right, bar.right - layout.padding, 'user menu end');

  if (isDesktop) {
    near(user.x - pending.right, layout.userGap, 'pending → user');
    near(box('crumbs').x, bar.x + layout.padding, 'breadcrumbs start');
    await expect(byId('nav-toggle')).not.toBeVisible();
    await expect(byId('divider')).not.toBeVisible();
  } else {
    const divider = box('divider');
    near(divider.x - pending.right, layout.gap, 'pending → divider');
    near(divider.height, 40, 'divider height');
    near(user.x - divider.right, layout.userGap, 'divider → user');
    // -ms-[0.5rem] pulls the toggle half a step into the padding.
    const toggle = box('nav-toggle');
    near(toggle.x - bar.x, layout.padding - 6, 'nav toggle start');
    near(toggle.width, 40, 'nav toggle width');
  }
}

export const AppHeaderLayoutDark: Story = {
  ...AppHeaderLayout,
  globals: { viewport: { value: 'widescreen' }, theme: 'dark' },
};

export const AppHeaderLayoutMobile: Story = {
  ...AppHeaderLayout,
  globals: { viewport: { value: 'mobile' } },
};

export const AppHeaderLayoutMobileDark: Story = {
  ...AppHeaderLayout,
  globals: { viewport: { value: 'mobile' }, theme: 'dark' },
};
