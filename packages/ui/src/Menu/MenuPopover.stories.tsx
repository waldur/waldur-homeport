import {
  CaretRightIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  StarIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactNode, useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { BaseButton } from '../BaseButton';

import { Menu, MenuPopover } from './Menu';

/**
 * Stories for `MenuPopover`: the menu surfaces on a Radix Popover, for
 * panels that hold inputs. A DropdownMenu's typeahead would take the
 * keystrokes typed into them. Panels are portaled, so the `play` functions
 * query `screen`, not the story canvas.
 */
const meta: Meta<typeof MenuPopover> = {
  title: 'Overlays/MenuPopover',
  component: MenuPopover,
  parameters: {
    docs: {
      description: {
        component:
          '`MenuPopover.Content` takes `look="nav"` (the default: the table filter menus and pickers, whose rows default to Metronic\'s base padding in gray-700) or `look="actions"`. A panel with no menu rows (the column picker, search results, call settings) is a plain `Popover` (see Overlays/Popover). `MenuPopover.Item` is a button row that does not close the panel; `Menu.Item` inside a popover closes it.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof MenuPopover>;

// See Menu.stories.tsx: keeps a panel shown open in a story from closing
// when focus moves elsewhere on the page.
const STAY_OPEN = {
  onOpenAutoFocus: (event: Event) => event.preventDefault(),
  onInteractOutside: (event: Event) => event.preventDefault(),
};

const Trigger = ({ label, icon }: { label: string; icon?: ReactNode }) => (
  <MenuPopover.Trigger asChild>
    <BaseButton variant="secondary" size="sm" label={label} iconNode={icon} />
  </MenuPopover.Trigger>
);

/**
 * The "Add filter" list: nav-look rows with the popover's default row
 * options. Each row would open its own flyout, so the rows are
 * `MenuPopover.Item` buttons that leave the panel open.
 */
export const NavFilterList: Story = {
  render: () => (
    <div className="p-12 pb-[260px]">
      <MenuPopover defaultOpen>
        <Trigger label="Add filter" icon={<FunnelSimpleIcon weight="bold" />} />
        <MenuPopover.Content
          {...STAY_OPEN}
          align="start"
          className="w-[250px] py-[9.75px] fw-bold"
        >
          {['Organization', 'Project', 'State', 'Offering'].map((name) => (
            <MenuPopover.Item key={name}>
              {name}
              <CaretRightIcon size={20} className="ms-auto" weight="bold" />
            </MenuPopover.Item>
          ))}
          <MenuPopover.Item>
            Saved filters (2)
            <StarIcon size={20} className="ms-auto" weight="bold" />
          </MenuPopover.Item>
        </MenuPopover.Content>
      </MenuPopover>
    </div>
  ),
};

const OPTIONS = ['Alpha cluster', 'Beta cluster', 'Gamma storage'];

const SearchableList = () => {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string>();
  return (
    <>
      <MenuPopover>
        <Trigger label="Pick a resource" />
        <MenuPopover.Content look="actions" align="start" className="w-[260px]">
          <label className="flex items-center gap-2 border-b px-[16px] py-[8px]">
            <MagnifyingGlassIcon weight="bold" />
            <input
              aria-label="Search"
              className="min-w-0 flex-1 outline-hidden"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {OPTIONS.filter((option) =>
            option.toLowerCase().includes(query.toLowerCase()),
          ).map((option) => (
            <Menu.Item key={option} onSelect={() => setPicked(option)}>
              {option}
            </Menu.Item>
          ))}
        </MenuPopover.Content>
      </MenuPopover>
      <p className="mt-3">Picked: {picked ?? 'nothing yet'}</p>
    </>
  );
};

/**
 * A search box above command rows: the input keeps every keystroke (a menu
 * would treat "a" as typeahead to the first row starting with "a"), and
 * picking a row (`Menu.Item`) still closes the panel.
 */
export const SearchAndPick: Story = {
  render: () => (
    <div className="p-12 pb-[260px]">
      <SearchableList />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Pick a resource' }),
    );
    const search = await screen.findByRole('textbox', { name: 'Search' });
    await userEvent.type(search, 'beta');
    await expect(search).toHaveValue('beta');
    await expect(
      screen.queryByRole('menuitem', { name: 'Alpha cluster' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Beta cluster' }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('textbox', { name: 'Search' })).toBeNull(),
    );
    await expect(canvas.getByText('Picked: Beta cluster')).toBeInTheDocument();
  },
};

/**
 * `forceMount`: the panel stays in the DOM, hidden, while closed. The table
 * filter panels rely on it: TableBody.tsx looks for their closed markup.
 */
export const ForceMounted: Story = {
  render: () => (
    <div className="p-12 pb-[200px]">
      <MenuPopover>
        <Trigger label="Filters" />
        <MenuPopover.Content forceMount align="start" className="w-[220px]">
          <MenuPopover.Item>State</MenuPopover.Item>
          <MenuPopover.Item>Project</MenuPopover.Item>
        </MenuPopover.Content>
      </MenuPopover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const row = screen.getByRole('button', { name: 'State', hidden: true });
    await expect(row).not.toBeVisible();
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Filters' }),
    );
    await waitFor(() => expect(row).toBeVisible());
  },
};
