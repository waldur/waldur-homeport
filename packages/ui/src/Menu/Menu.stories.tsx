import {
  ArchiveIcon,
  CopyIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactNode, useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { BaseButton } from '../BaseButton';

import { Menu, MenuPopover } from './Menu';

/**
 * Stories for waldur-ui's `Menu`: the two looks, the row options, submenus,
 * radio rows, static rows, hover-to-open, and the three kinds of container
 * a `Menu.Item` renders for. Menus are portaled, so the `play` functions
 * query `screen`, not the story canvas.
 */
const meta: Meta<typeof Menu> = {
  title: 'Overlays/Menu',
  component: Menu,
  parameters: {
    docs: {
      description: {
        component:
          'Radix DropdownMenu with the app\'s looks built in. `look="nav"` (the default) is the header, page-tab and footer menus; `look="actions"` is row actions and "Add" menus. Rows read the look and the panel\'s row options through React context, so submenus inherit them. See docs/tailwind-shadcn-migration-notes.md, "Dropdown & Menu System Map".',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Menu>;

const Trigger = ({ label }: { label: string }) => (
  <Menu.Trigger asChild>
    <BaseButton variant="secondary" size="sm" label={label} />
  </Menu.Trigger>
);

// A story that shows several panels open at once: each would take focus as
// it opens, and Radix closes a panel when focus or a click lands outside it.
const STAY_OPEN = {
  onOpenAutoFocus: (event: Event) => event.preventDefault(),
  onInteractOutside: (event: Event) => event.preventDefault(),
};

// Room below each trigger for its open panel.
const Gallery = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-start gap-x-[260px] gap-y-[240px] p-12 pb-[320px]">
    {children}
  </div>
);

/**
 * The two looks, open. Nav: Metronic's `.menu-sub-dropdown` (no border, the
 * page background, gray-600 rows on a gray-50 highlight). Actions:
 * Bootstrap's `.dropdown-menu` as this app configured it (13px panel, 14px
 * gray-700 rows, a 130px minimum width).
 */
export const Looks: Story = {
  render: () => (
    <Gallery>
      <Menu defaultOpen>
        <Trigger label="Nav look" />
        <Menu.Content
          {...STAY_OPEN}
          look="nav"
          align="start"
          className="w-[275px] py-[12px] text-[14px] font-medium"
        >
          <Menu.Label>Profile</Menu.Label>
          <Menu.Item>User dashboard</Menu.Item>
          <Menu.Item className="active">Credentials</Menu.Item>
          <Menu.Item>Notifications</Menu.Item>
          <Menu.Separator />
          <Menu.Item>Log out</Menu.Item>
          <Menu.Item disabled>Web shell (disabled)</Menu.Item>
        </Menu.Content>
      </Menu>
      <Menu defaultOpen>
        <Trigger label="Actions look" />
        <Menu.Content {...STAY_OPEN} look="actions" align="start">
          <Menu.Label>Manage resource</Menu.Label>
          <Menu.Item icon={<PencilSimpleIcon weight="bold" />}>
            Edit details
          </Menu.Item>
          <Menu.Item icon={<CopyIcon weight="bold" />}>Duplicate</Menu.Item>
          <Menu.Item disabled icon={<ArchiveIcon weight="bold" />}>
            Archive (disabled)
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item
            icon={<TrashIcon weight="bold" />}
            className="text-[var(--pill-danger-text)] action-row-active:text-[var(--pill-danger-text)]"
          >
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>
    </Gallery>
  ),
};

const DENSITIES = ['default', 'compact', 'base'] as const;

const TONES = ['default', 'strong'] as const;

/**
 * The nav look's row options, set on the panel: `density` (default
 * 10×16px, compact 8×9.75px as in the footer, base 8×12px as in the filter
 * popovers) and `tone` (default gray-600, strong gray-700). Each panel also
 * shows a highlighted (`.active`) and a disabled row.
 */
export const RowOptions: Story = {
  render: () => (
    <Gallery>
      {TONES.map((tone) =>
        DENSITIES.map((density) => (
          <Menu key={`${tone}-${density}`} defaultOpen>
            <Trigger label={`${density}, ${tone}`} />
            <Menu.Content
              {...STAY_OPEN}
              align="start"
              density={density}
              tone={tone}
              className="w-[200px] py-[6.5px]"
            >
              <Menu.Item>A row</Menu.Item>
              <Menu.Item className="active">Highlighted</Menu.Item>
              <Menu.Item disabled>Disabled</Menu.Item>
            </Menu.Content>
          </Menu>
        )),
      )}
    </Gallery>
  ),
};

/**
 * A submenu opens on hover or ArrowRight. It is portaled out of its parent
 * panel, so it takes row options of its own (here the same compact density
 * as the parent).
 */
export const Submenus: Story = {
  render: () => (
    <div className="p-12 pb-[300px]">
      <Menu>
        <Trigger label="Export" />
        <Menu.Content
          align="start"
          density="compact"
          className="w-[200px] py-[6.5px]"
        >
          <Menu.Item>Quick export</Menu.Item>
          <Menu.Sub>
            <Menu.SubTrigger>Download as…</Menu.SubTrigger>
            <Menu.SubContent density="compact" className="w-[175px] py-[6.5px]">
              <Menu.Item>PDF report</Menu.Item>
              <Menu.Item>CSV spreadsheet</Menu.Item>
              <Menu.Item>JSON payload</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Export' }),
    );
    const subTrigger = await screen.findByRole('menuitem', {
      name: 'Download as…',
    });
    subTrigger.focus();
    await userEvent.keyboard('{ArrowRight}');
    const pdf = await screen.findByRole('menuitem', { name: 'PDF report' });
    // The submenu's rows are compact: 8px top padding.
    await expect(getComputedStyle(pdf).paddingTop).toBe('8px');
    await expect(subTrigger).toHaveAttribute('data-state', 'open');
  },
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'et', label: 'Eesti' },
  { code: 'de', label: 'Deutsch' },
];

const LanguageList = () => {
  const [language, setLanguage] = useState('en');
  return (
    <Menu defaultOpen>
      <Trigger label="Language" />
      <Menu.Content
        {...STAY_OPEN}
        align="start"
        className="w-[175px] py-[12px]"
      >
        <Menu.RadioGroup value={language} onValueChange={setLanguage}>
          {LANGUAGES.map(({ code, label }) => (
            <Menu.RadioItem
              key={code}
              value={code}
              // Picking keeps the menu open, to show the highlight move.
              onSelect={(event) => event.preventDefault()}
            >
              {label}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu>
  );
};

/**
 * Picking one value: the checked row is highlighted like the current page's
 * row, with no check mark. Radix gives each row role="menuitemradio" and
 * aria-checked.
 */
export const RadioRows: Story = {
  render: () => (
    <div className="p-12 pb-[240px]">
      <LanguageList />
    </div>
  ),
  play: async () => {
    const english = await screen.findByRole('menuitemradio', {
      name: 'English',
    });
    const deutsch = screen.getByRole('menuitemradio', { name: 'Deutsch' });
    await expect(english).toHaveAttribute('aria-checked', 'true');
    // Rows fade their colours in over 200ms.
    await waitFor(() =>
      expect(getComputedStyle(english).backgroundColor).not.toBe(
        getComputedStyle(deutsch).backgroundColor,
      ),
    );
    const highlighted = getComputedStyle(english).backgroundColor;
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Eesti' }));
    const eesti = screen.getByRole('menuitemradio', { name: 'Eesti' });
    await expect(eesti).toHaveAttribute('aria-checked', 'true');
    await userEvent.unhover(eesti);
    await waitFor(() =>
      expect(getComputedStyle(eesti).backgroundColor).toBe(highlighted),
    );
    await waitFor(() =>
      expect(getComputedStyle(english).backgroundColor).toBe(
        getComputedStyle(deutsch).backgroundColor,
      ),
    );
  },
};

const ThemeToggle = () => {
  const [dark, setDark] = useState(false);
  return (
    <Menu.CheckboxItem checked={dark} onCheckedChange={setDark}>
      Dark theme
    </Menu.CheckboxItem>
  );
};

/**
 * Settings and values in a menu, as menu items: `Menu.CheckboxItem`
 * (role="menuitemcheckbox", shown as a switch, keeps the menu open) and
 * `Menu.CopyItem` (copies a value and stays open; the caller renders the
 * row, given whether it was just copied).
 */
export const CheckboxAndCopyItems: Story = {
  render: () => (
    <div className="p-12 pb-[240px]">
      <Menu>
        <Trigger label="Preferences" />
        <Menu.Content align="start" className="w-[275px] py-[12px]">
          <ThemeToggle />
          <Menu.Separator />
          <Menu.CopyItem
            value="192.0.2.10"
            className="block"
            copiedAnnouncement="Copied"
          >
            {(copied) => (
              <>
                <span className="mb-[6.5px] block">IP address:</span>
                <span className="flex justify-between text-[var(--menu-item-muted-text)]">
                  192.0.2.10
                  <span aria-hidden="true">{copied ? 'Copied' : 'Copy'}</span>
                </span>
              </>
            )}
          </Menu.CopyItem>
        </Menu.Content>
      </Menu>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Preferences' }),
    );
    const toggle = await screen.findByRole('menuitemcheckbox', {
      name: 'Dark theme',
    });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    // Toggling a setting keeps the menu open.
    await expect(screen.getByRole('menu')).toBeInTheDocument();
    await expect(
      screen.getByRole('menuitem', { name: 'IP address: 192.0.2.10' }),
    ).toBeInTheDocument();
  },
};

/**
 * `openOnHover`: opens when the pointer reaches the trigger and closes
 * 200ms after it leaves both trigger and panel. The page tabs and footer
 * menus use `openOnHover="desktop"`, which only hovers at the `lg`
 * breakpoint and up and clicks below it; this story uses `true` so it
 * behaves the same at any width.
 */
export const OpenOnHover: Story = {
  render: () => (
    <div className="p-12 pb-[240px]">
      <Menu openOnHover>
        <Trigger label="Offerings" />
        <Menu.Content align="start" className="w-[200px] py-[6.5px]">
          <Menu.Item>All offerings</Menu.Item>
          <Menu.Item>My offerings</Menu.Item>
        </Menu.Content>
      </Menu>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Offerings',
    });
    await userEvent.hover(trigger);
    const row = await screen.findByRole('menuitem', { name: 'All offerings' });
    // After the entrance fade.
    await waitFor(() => expect(row).toBeVisible());
    // A click on a hover-opened trigger keeps it open.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.unhover(trigger);
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
  },
};

/**
 * Choosing a row calls `onSelect` and closes the menu, by pointer or by
 * keyboard (arrow keys, then Enter).
 */
export const SelectingARow: Story = {
  args: { onOpenChange: fn() },
  render: (args) => {
    const onSelect = fn();
    return (
      <div className="p-12 pb-[240px]">
        <Menu onOpenChange={args.onOpenChange}>
          <Trigger label="Actions" />
          <Menu.Content look="actions" align="start">
            <Menu.Item onSelect={onSelect}>Edit</Menu.Item>
            <Menu.Item onSelect={onSelect}>Duplicate</Menu.Item>
          </Menu.Content>
        </Menu>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Actions',
    });
    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Edit' }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );

    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('menu');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};

/**
 * One `Menu.Item`, three renderings, decided by what it sits in: a Radix
 * menu item in a `Menu`, a button that closes the panel in a `MenuPopover`,
 * and a plain `<button>` with no panel at all (the "show all actions"
 * dialog lists its actions this way: it is no menu).
 */
export const ItemKinds: Story = {
  render: () => (
    <Gallery>
      <Menu defaultOpen>
        <Trigger label="In a Menu" />
        <Menu.Content {...STAY_OPEN} look="actions" align="start">
          <Menu.Item>Radix menu item</Menu.Item>
        </Menu.Content>
      </Menu>
      <MenuPopover defaultOpen>
        <MenuPopover.Trigger asChild>
          <BaseButton variant="secondary" size="sm" label="In a MenuPopover" />
        </MenuPopover.Trigger>
        <MenuPopover.Content {...STAY_OPEN} look="actions" align="start">
          <Menu.Item>Closing button</Menu.Item>
        </MenuPopover.Content>
      </MenuPopover>
      <div className="w-[200px] rounded-lg border border-[var(--surface-card-border)]">
        <Menu.Item look="actions">Plain button</Menu.Item>
      </div>
    </Gallery>
  ),
  play: async () => {
    const inMenu = await screen.findByRole('menuitem', {
      name: 'Radix menu item',
    });
    await expect(inMenu.tagName).toBe('DIV');
    const inPopover = screen.getByRole('menuitem', { name: 'Closing button' });
    await expect(inPopover.tagName).toBe('BUTTON');
    const plain = screen.getByRole('button', { name: 'Plain button' });
    await expect(plain.tagName).toBe('BUTTON');
  },
};
