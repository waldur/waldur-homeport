import {
  ArrowsClockwiseIcon,
  DotsSixVerticalIcon,
  PencilSimpleIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { forwardRef, ReactNode, useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { Menu, MenuPopover } from 'waldur-ui';

import { ActionGroup } from '@/marketplace/resources/actions/ActionGroup';
import { ActionList } from '@/marketplace/resources/actions/ActionList';
import { ActionItem } from '@/resource/actions/ActionItem';

import {
  ActionsDropdown,
  ActionsMenu,
  TableDropdownToggle,
} from './ActionsDropdown';

/**
 * Stories for the action menus: `ActionsMenu` (a trigger plus an
 * actions-look panel), its rows, `ActionItem` and `ActionList` filtering.
 * Panels are portaled, so the `play` functions query `screen`, not the
 * story canvas.
 */
const meta: Meta<typeof ActionsMenu> = {
  title: 'Actions/ActionsMenu',
  component: ActionsMenu,
  parameters: {
    docs: {
      description: {
        component:
          'Row actions and "Add" menus. `toggle` is `"kebab"` (the default), `"labeled"`, `"add"` or an element of your own. The panel opens to the left of the toggle, aligned to its start, unless given a `side` / `align`; "Add" and toolbar menus pass `side="bottom"`. `ActionsDropdown` is a wrapper over it with older row-action props.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-12" style={{ minHeight: 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ActionsMenu>;

const noop = () => undefined;

// A panel shown open in a story keeps focus where it is, so that several
// can be open at once (see Menu.stories.tsx).
const STAY_OPEN = {
  defaultOpen: true,
  onOpenAutoFocus: (event: Event) => event.preventDefault(),
  onInteractOutside: (event: Event) => event.preventDefault(),
};

const items = (
  <>
    <ActionItem
      title="Edit"
      action={noop}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
    <ActionItem
      title="Refresh"
      action={noop}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
    <ActionItem
      title="Delete"
      action={noop}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  </>
);

const DragHandle = forwardRef<HTMLButtonElement>((props, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label="Reorder"
    className="rounded-md border px-2 py-1"
    {...props}
  >
    <DotsSixVerticalIcon weight="bold" />
  </button>
));
DragHandle.displayName = 'DragHandle';

const Row = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-start gap-[200px]">{children}</div>
);

/**
 * The four toggles: the kebab (row actions), labeled (toolbars), "Add"
 * (team and organization "Add" menus) and a toggle of your own, which must
 * forward its ref. Click one to open it.
 */
export const Toggles: Story = {
  render: () => (
    <Row>
      <ActionsMenu side="bottom" align="start">
        {items}
      </ActionsMenu>
      <ActionsMenu toggle="labeled" side="bottom" align="start">
        {items}
      </ActionsMenu>
      <ActionsMenu toggle="add" size="lg" side="bottom" align="start">
        <Menu.Item>Invite by mail</Menu.Item>
        <Menu.Item>Group invitation</Menu.Item>
        <Menu.Item>Member</Menu.Item>
      </ActionsMenu>
      <ActionsMenu toggle={<DragHandle />} side="bottom" align="start">
        <Menu.Item>Move up</Menu.Item>
        <Menu.Item>Move down</Menu.Item>
      </ActionsMenu>
    </Row>
  ),
};

/**
 * The labeled toggle on the `primary` variant, not just the default
 * `tertiary`: the caret's colour once came from `.svg-icon`'s fixed gray,
 * invisible on `tertiary` but wrong on `primary`'s white text (ProviderCard's
 * "Enabled" toggle). Kept here so that regression stays visible.
 */
export const LabeledVariantsAndSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <ActionsMenu toggle="labeled" label="Enabled" variant="primary">
        {items}
      </ActionsMenu>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ActionsMenu
          key={size}
          toggle="labeled"
          label={`Size ${size}`}
          size={size}
          toggleClassName="w-auto"
        >
          {items}
        </ActionsMenu>
      ))}
    </div>
  ),
};

/**
 * What an `ActionItem` row can carry: an icon, a disabled state with the
 * reason in a tooltip, a staff-only indicator, a danger colour, and
 * `ActionGroup` captions.
 */
export const ActionItems: Story = {
  render: () => (
    <ActionsMenu toggle="labeled" side="bottom" align="start" {...STAY_OPEN}>
      <ActionGroup title="Lifecycle">
        <ActionItem
          title="Start"
          action={noop}
          iconNode={<PlayIcon weight="bold" />}
          disabled
          tooltip="The resource is already running"
        />
        <ActionItem
          title="Stop"
          action={noop}
          iconNode={<StopIcon weight="bold" />}
        />
        <ActionItem title="Force destroy" action={noop} staff />
      </ActionGroup>
      <ActionGroup title="Danger zone">
        <ActionItem
          title="Delete"
          action={noop}
          iconNode={<TrashIcon weight="bold" />}
          iconColor="danger"
          className="text-danger"
        />
      </ActionGroup>
    </ActionsMenu>
  ),
};

/**
 * Where the panel opens: to the left of the toggle, aligned to its top, by
 * default (row actions sit at the right edge of a table), or wherever
 * `side` and `align` say. "Add" and toolbar menus open below.
 */
export const Placement: Story = {
  render: () => (
    <div className="flex justify-center gap-[200px] pt-[40px]">
      <ActionsMenu toggle="labeled" label="Default (left)" {...STAY_OPEN}>
        {items}
      </ActionsMenu>
      <ActionsMenu
        toggle="labeled"
        label="side=bottom"
        side="bottom"
        align="start"
        {...STAY_OPEN}
      >
        {items}
      </ActionsMenu>
      <ActionsMenu
        toggle="labeled"
        label="bottom, align=end"
        side="bottom"
        align="end"
        {...STAY_OPEN}
      >
        {items}
      </ActionsMenu>
    </div>
  ),
};

/**
 * Choosing an action runs it and closes the menu.
 */
export const RunningAnAction: Story = {
  args: { onOpenChange: fn() },
  render: (args) => {
    const restart = fn();
    return (
      <ActionsMenu
        toggle="labeled"
        side="bottom"
        align="start"
        onOpenChange={args.onOpenChange}
      >
        <ActionItem title="Restart" action={restart} />
        <ActionItem title="Delete" action={noop} disabled tooltip="Locked" />
      </ActionsMenu>
    );
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Actions' }),
    );
    const menu = await screen.findByTestId('actions-menu');
    await expect(menu).toHaveAttribute('role', 'menu');
    // A disabled action can't be chosen: Radix skips it, and it takes no
    // pointer events.
    const deleteRow = screen.getByRole('menuitem', { name: 'Delete' });
    await expect(deleteRow).toHaveAttribute('data-disabled');
    await expect(getComputedStyle(deleteRow).pointerEvents).toBe('none');
    await userEvent.click(screen.getByRole('menuitem', { name: 'Restart' }));
    await waitFor(() =>
      expect(screen.queryByTestId('actions-menu')).not.toBeInTheDocument(),
    );
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

const VARIABLES = ['DATABASE_URL', 'API_TOKEN', 'REGION'];

const VariablesMenu = () => {
  const [query, setQuery] = useState('');
  return (
    <MenuPopover>
      <MenuPopover.Trigger asChild>
        <TableDropdownToggle labeled label="Environment variables" />
      </MenuPopover.Trigger>
      <MenuPopover.Content
        look="actions"
        side="bottom"
        align="start"
        className="w-[280px] max-h-(--radix-popover-content-available-height) overflow-y-auto"
        data-testid="actions-menu"
      >
        <input
          aria-label="Search"
          placeholder="Search…"
          className="w-full border-b px-[16px] py-[8px] outline-hidden"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {VARIABLES.filter((name) =>
          name.toLowerCase().includes(query.toLowerCase()),
        ).map((name) => (
          <Menu.Item key={name}>{name}</Menu.Item>
        ))}
      </MenuPopover.Content>
    </MenuPopover>
  );
};

/**
 * A popover with an actions panel: when a panel holds an input like a search box,
 * use `MenuPopover` with `TableDropdownToggle` and `MenuPopover.Content look="actions"`.
 * This keeps every keystroke (a menu would use them for typeahead), and choosing a row still
 * closes it. Used in the offering script editor's "Environment variables" menu.
 */
export const AsPopoverWithSearch: Story = {
  render: () => <VariablesMenu />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Environment variables',
      }),
    );
    const search = await screen.findByRole('textbox', { name: 'Search' });
    await userEvent.type(search, 'api');
    await expect(search).toHaveValue('api');
    await expect(
      screen.queryByRole('menuitem', { name: 'REGION' }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'API_TOKEN' }));
    await waitFor(() =>
      expect(screen.queryByTestId('actions-menu')).not.toBeInTheDocument(),
    );
  },
};

const ResourceActions = () => (
  <>
    <ActionGroup title="Lifecycle">
      <ActionItem title="Start" action={noop} important />
      <ActionItem title="Stop" action={noop} important />
      <ActionItem title="Restart" action={noop} />
    </ActionGroup>
    <ActionGroup title="Settings">
      <ActionItem title="Rename" action={noop} />
      <ActionItem title="Change limits" action={noop} important />
    </ActionGroup>
  </>
);

const ShowAllActions = () => {
  const [query, setQuery] = useState('');
  return (
    <div className="w-[320px] rounded-lg border border-[var(--surface-card-border)]">
      <input
        aria-label="Search actions"
        placeholder="Search…"
        className="w-full border-b px-[16px] py-[8px] outline-hidden"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ActionList query={query}>
        <ResourceActions />
      </ActionList>
    </div>
  );
};

/**
 * `ActionList` filters the actions inside it. Left: the quick actions a
 * resource's menu shows (`hideNonImportant`, `hideGroupName`). Right: the
 * "show all actions" dialog's searchable list, outside any menu, where each
 * row is a plain button (the dialog is no menu).
 */
export const ActionListFiltering: Story = {
  render: () => (
    <div className="flex items-start gap-[200px]">
      <ActionsMenu toggle="labeled" side="bottom" align="start" {...STAY_OPEN}>
        <ActionList hideNonImportant hideGroupName>
          <ResourceActions />
        </ActionList>
      </ActionsMenu>
      <ShowAllActions />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Search actions' }),
      'st',
    );
    const list = canvas.getByRole('textbox', { name: 'Search actions' })
      .parentElement as HTMLElement;
    const rows = within(list).getAllByRole('button');
    await expect(rows.map((row) => row.textContent)).toEqual([
      'Start',
      'Stop',
      'Restart',
    ]);
    await expect(rows[0].tagName).toBe('BUTTON');
  },
};

/**
 * The states `ActionsDropdown` renders when its actions are loading, failed
 * to load, or there are none.
 */
export const LoadingErrorAndEmpty: Story = {
  render: () => (
    <Row>
      <ActionsDropdown labeled label="Loading" loading side="bottom" />
      <ActionsDropdown labeled label="Error" error side="bottom" />
      <ActionsDropdown labeled label="Empty" side="bottom" />
    </Row>
  ),
};
