# Menus, Dropdowns and Popovers

How to build any menu or menu-like popover in HomePort: row actions, "Add" menus, the header and footer menus, page-tab submenus, filter and picker popovers. Every one of them is built from the same few parts in `waldur-ui`.

> [!TIP]
> In a hurry? Find your case in [Choosing a component](#choosing-a-component), copy the matching [recipe](#recipes), and check the [rules](#rules).

---

## Choosing a component

| You are building                                                  | Use                                                     | Recipe                                                    |
| :---------------------------------------------------------------- | :------------------------------------------------------ | :-------------------------------------------------------- |
| Actions for a table row (the 3-dots menu)                         | `ActionsDropdown` + `ActionItem`                        | [Row actions](#row-actions)                               |
| A toolbar menu with a caption ("Actions", "Export")               | `ActionsMenu toggle="labeled"`                          | [Toolbar and "Add" menus](#toolbar-and-add-menus)         |
| An "Add" menu (invite, add member, create organization)           | `ActionsMenu toggle="add"`                              | [Toolbar and "Add" menus](#toolbar-and-add-menus)         |
| An action menu opened by your own button                          | `ActionsMenu toggle={<YourButton />}`                   | [Custom trigger](#custom-trigger)                         |
| An action menu whose trigger sits elsewhere in the markup         | `Menu` + `Menu.Trigger` + `Menu.Content look="actions"` | [Trigger elsewhere](#trigger-elsewhere)                   |
| An action menu with a search box or other input                   | `MenuPopover` with `look="actions"`                     | [Menu with a search box](#menu-with-a-search-box)         |
| Header, user, language, page-tab or footer menu                   | `Menu` (nav look), `NavMenuLink` for router links       | [Nav menus](#nav-menus)                                   |
| A filter list or picker holding inputs                            | `MenuPopover` (nav look)                                | [Filter and picker popovers](#filter-and-picker-popovers) |
| A panel with no menu rows (column picker, search results, a form) | `Popover` + `PopoverContent`                            | [Plain popovers](#plain-popovers)                         |
| Resource actions filtered by importance or a search query         | `ActionList` around `ActionItem`s                       | [Filtering resource actions](#filtering-resource-actions) |

**Menu or popover?** If every child is a command row, it is a menu. If the panel holds an input, a select, a date picker or a search field, it is a popover: a menu's typeahead takes the keystrokes typed into an input. A popover is a `MenuPopover` only when it holds menu rows (`Menu.Item`, `MenuPopover.Item`, rows styled with `useMenuItemClassName`); anything else is a plain `Popover`.

---

## Rules

- **ALWAYS** build menus from `Menu` / `MenuPopover` (`waldur-ui`) or the app components on top of them (`ActionsMenu`, `ActionsDropdown`, `ActionItem`, `NavMenuLink`). **NEVER** import `@radix-ui/react-dropdown-menu` or `@radix-ui/react-popover` outside `packages/ui` (ESLint rejects it).
- **NEVER** hand-roll a menu with `react-bootstrap` `Dropdown`, `DropdownButton` or Bootstrap/Metronic classes (`dropdown-menu`, `dropdown-item`, `menu-sub-dropdown`, `menu-link`, …). That CSS has been deleted.
- **Row actions** use the 3-dots pattern: `ActionsDropdown` with `ActionItem` children (see CLAUDE.md). No standalone buttons in `rowActions`.
- **Rows** are `Menu.Item` (or `ActionItem` in action menus). React to them with `onSelect`, not `onClick`: it fires for pointer and keyboard, and the panel closes afterwards unless the handler calls `event.preventDefault()`.
- **A custom trigger** must `forwardRef` to a real `<button>` and spread `...props` onto it, or the menu won't open or position.
- **Placement** is Radix `side` / `align`. `Menu.Content`'s default `align` is `center`; say `align="start"` for a menu that opens from its trigger's start edge.
- **Row options** (`density`, `tone`) go on the panel, never on rows and never as `menu-gray-*`/`menu-state-*` classes.
- **Test hooks** (`data-testid="actions-menu"`, `"action-item"`, `"actions-toggle"`, roles and accessible names) are used by waldur-integration-testing. Don't remove or rename them; see [E2E Locators](e2e-locators.md).

---

## The parts

| Part                         | Where                                  | What it is                                                                                                     |
| :--------------------------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `Menu`                       | `packages/ui/src/Menu/` (`waldur-ui`)  | Radix DropdownMenu with the app's defaults and looks built in                                                  |
| `Menu.TriggerButton`         | same                                   | Dropdown button trigger wrapping BaseButton and rotating ButtonCaret                                           |
| `MenuPopover`                | same                                   | The same surfaces on a Radix Popover, for panels with inputs                                                   |
| `menuSurface`, `menuItem`, … | `packages/ui/src/Menu/` (collocated)   | The looks, as cva recipes collocated with each component (`MenuContent.tsx`, `MenuItem.tsx`, …)                |
| `MenuLookProvider`, hooks    | `packages/ui/src/Menu/menuContext.tsx` | The look and container kind a panel hands to its rows; `useMenuItemClassName()` for an element styled as a row |
| `ActionsMenu`                | `src/table/ActionsDropdown.tsx`        | An action menu with its trigger (kebab, labeled, "Add" or custom)                                              |
| `ActionsDropdown`            | same                                   | Row-actions facade over `ActionsMenu`                                                                          |
| `ActionItem`                 | `src/resource/actions/ActionItem.tsx`  | An action row with icon, tooltip and staff indicator, hidden when `ActionList`'s filter rejects it             |
| `ActionList`, `ActionGroup`  | `src/marketplace/resources/actions/`   | A filter for the `ActionItem`s inside it; a captioned group of actions                                         |
| `NavMenuLink`                | `src/navigation/NavMenu.tsx`           | A nav row that is a ui-router link                                                                             |

Stories: `Overlays/Menu`, `Overlays/MenuPopover` and `Actions/ActionsMenu` in Storybook (`yarn storybook`) show every look, option and behaviour, open.

---

## Recipes

### Row actions

```tsx
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { ActionItem } from '@/resource/actions/ActionItem';
import { TrashIcon } from '@phosphor-icons/react';

rowActions={({ row }) => (
  <ActionsDropdown row={row} refetch={tableProps.fetch}>
    <ActionItem
      title={translate('Delete')}
      action={() => openDeleteDialog(row)}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  </ActionsDropdown>
)}
```

- Instead of children, `actions={[EditAction, DeleteAction]}` renders each component with `row`, `refetch` and the `data` object's fields as props.
- `loading` and `error` show a disabled "Loading actions" / "Unable to load actions" row; with no children and no actions it shows "There are no actions."
- The panel opens to the left of the kebab (row actions sit at a table's right edge). `side="bottom"` changes that.
- On an unavailable offering, the page wraps itself in `<ActionsUnavailable reason={…}>`: every action menu inside shows its toggle disabled, with the reason in a tooltip, and doesn't open.
- `ActionItem` props: `title` (or `label`), `action`, `iconNode`, `iconColor`, `disabled` with `tooltip` (the reason), `staff` (staff-only indicator), `important`, `className`; `actionId` + `resource` hide the action when the resource's offering lists it in `disabled_resource_actions`.

### Toolbar and "Add" menus

```tsx
import { Menu } from 'waldur-ui';
import { ActionsMenu } from '@/table/ActionsDropdown';

<ActionsMenu toggle="labeled" label={translate('Export')} side="bottom" align="end">
  <Menu.Item onSelect={exportCsv}>CSV</Menu.Item>
  <Menu.Item onSelect={exportPdf}>PDF</Menu.Item>
</ActionsMenu>

<ActionsMenu toggle="add" size="lg" side="bottom" align="start">
  <InvitationCreateButton refetch={refetch} />
  <UserAddButton refetch={refetch} />
</ActionsMenu>
```

`ActionsMenu` props: `toggle` (`"kebab"` default, `"labeled"`, `"add"`, or an element), `label`, `variant`, `size`, `toggleClassName`, `disabled`, `tooltip` (shown on a disabled toggle), `onOpenChange`, `defaultOpen`; everything else (`side`, `align`, `className`, `style`, `collisionPadding`, `container`, …) goes to the panel. It opens to the left of the toggle, aligned to its start (row actions sit at a table's right edge); "Add" and toolbar menus pass `side="bottom"`.

For toolbar menus without `ActionsMenu` facades, compose `waldur-ui`'s `Menu` directly with `Menu.TriggerButton`:

```tsx
<Menu>
  <Menu.TriggerButton variant="tertiary" size="lg">
    {translate('Export')}
  </Menu.TriggerButton>
  <Menu.Content look="actions" side="bottom" align="end">
    <Menu.Item onSelect={exportCsv}>CSV</Menu.Item>
    <Menu.Item onSelect={exportPdf}>PDF</Menu.Item>
  </Menu.Content>
</Menu>
```

Rows inside can be `Menu.Item`, `ActionItem`, or components that render one (`InvitationCreateButton` renders an `ActionItem`).

### Custom trigger

```tsx
const ThreadMenuToggle = forwardRef<HTMLButtonElement>((props, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={translate('Thread actions')}
    {...props}
  >
    <DotsThreeIcon weight="bold" />
  </button>
));

<ActionsMenu toggle={<ThreadMenuToggle />} side="bottom" align="end">
  …
</ActionsMenu>;
```

`BaseButton` already forwards its ref, so `toggle={<BaseButton … />}` works too (`ResourceAccessButton.tsx`, `WidgetCard.tsx`).

### Trigger elsewhere

When the trigger is rendered inside another component (a header slot, a wrapper with a badge), use the parts:

```tsx
import { Menu } from 'waldur-ui';

<Menu>
  <SidebarBrand
    shortcutsButton={
      <Menu.Trigger asChild>
        <IconButton
          icon={<SquaresFourIcon />}
          label={translate('Quick shortcuts')}
        />
      </Menu.Trigger>
    }
  />
  <Menu.Content look="actions" align="start">
    <Menu.Item asChild>
      <a href={link} target="_blank" rel="noopener noreferrer">
        {name}
      </a>
    </Menu.Item>
  </Menu.Content>
</Menu>;
```

See `WaldurSidebarBrand.tsx` and `ResourceUsageForm.tsx`.

### Menu with a search box

When an action-styled panel holds an input (such as a search box), use `MenuPopover` with `look="actions"` instead of `ActionsMenu`, because a menu's typeahead would intercept keystrokes:

```tsx
<MenuPopover>
  <MenuPopover.Trigger asChild>
    <TableDropdownToggle labeled label={translate('Variables')} />
  </MenuPopover.Trigger>
  <MenuPopover.Content
    look="actions"
    side="bottom"
    align="start"
    className="max-h-(--radix-popover-content-available-height) overflow-y-auto"
  >
    <FilterBox
      type="search"
      onChange={(e) => setQuery(e.target.value)}
      autoFocus
    />
    {filtered.map((item) => (
      <Menu.Item key={item.name} onSelect={() => insert(item)}>
        {item.name}
      </Menu.Item>
    ))}
  </MenuPopover.Content>
</MenuPopover>
```

The input keeps every keystroke, and choosing a `Menu.Item` row still closes the panel (`ScriptEditorHeader.tsx`).

### Nav menus

The header user menu, the language submenu, page-tab submenus and the footer menus use `Menu` in its default `nav` look:

```tsx
import { Menu } from 'waldur-ui';
import { NavMenuLink } from '@/navigation/NavMenu';

<Menu>
  <Menu.Trigger asChild>
    <UserMenuToggle />
  </Menu.Trigger>
  <Menu.Content align="end" className="fw-bold py-4 fs-6 w-275px">
    <UISrefActive class="active">
      <NavMenuLink state="profile.details" label={translate('Profile')} />
    </UISrefActive>
    <Menu.Sub>
      <Menu.SubTrigger>{translate('Language')}</Menu.SubTrigger>
      <Menu.SubContent className="fw-bold w-175px py-4">
        <Menu.RadioGroup value={current} onValueChange={setLanguage}>
          <Menu.RadioItem value="en">English</Menu.RadioItem>
          <Menu.RadioItem value="et">Eesti</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.SubContent>
    </Menu.Sub>
    <Menu.Separator />
    <Menu.CheckboxItem checked={dark} onCheckedChange={toggleTheme}>
      {translate('Dark theme')}
    </Menu.CheckboxItem>
    <Menu.CopyItem
      value={user.ip_address}
      label={translate('IP address')}
      detail={user.ip_address}
      copiedLabel={translate('Copied')}
    />
    <Menu.Item onSelect={logout}>{translate('Log out')}</Menu.Item>
  </Menu.Content>
</Menu>;
```

- `NavMenuLink` composes the app's `Link` as the row; `UISrefActive` adds `.active` on the current page, which highlights the row.
- `Menu.RadioItem`: the checked row is highlighted like the current page, with no check mark; Radix gives it `role="menuitemradio"` and `aria-checked`.
- **Only menu items in a menu.** A menu (`role="menu"`) may hold items, groups and separators, nothing else: no inputs, links or buttons that arrow keys can't reach. A setting is `Menu.CheckboxItem` (`role="menuitemcheckbox"`, shown as a switch, keeps the menu open); a value to copy is `Menu.CopyItem` (copies and confirms in place); a link is `Menu.Item asChild` or `NavMenuLink`. Anything else belongs in a `MenuPopover`.
- `Menu.Group` with a `Menu.Label` (linked by `aria-labelledby`) names a group of rows; `ActionGroup` does this for actions.
- `Menu.Label` and `Menu.Separator` are a section caption and a divider in the panel's look.
- Typography (`fw-bold`, `fs-6`) is set per panel. In `packages/shell` and the micro-app, which have no Bootstrap, write it in Tailwind (`py-[12px] text-[14px] font-medium`).

**Hover to open** (page tabs, footer): `<Menu openOnHover="desktop">` opens on hover at the `lg` breakpoint and up, and on click below it, with a 200ms close delay. `openOnHover` (or `={true}`) hovers at every width. `open`/`onOpenChange` may still be controlled, e.g. to close the menu on Tab (`TabsList.tsx`).

### Filter and picker popovers

```tsx
import { MenuPopover } from 'waldur-ui';

<MenuPopover>
  <MenuPopover.Trigger asChild>
    <BaseButton label={translate('Add filter')} />
  </MenuPopover.Trigger>
  <MenuPopover.Content align="start" className="w-250px py-3">
    {filters.map((filter) => (
      <MenuPopover key={filter.name}>
        <MenuPopover.Trigger asChild>
          <MenuPopover.Item>{filter.title}</MenuPopover.Item>
        </MenuPopover.Trigger>
        <MenuPopover.Content side="right" align="start">
          {filter.component}
        </MenuPopover.Content>
      </MenuPopover>
    ))}
  </MenuPopover.Content>
</MenuPopover>;
```

- `MenuPopover.Content` defaults to the nav look with the filter rows' options (Metronic's base padding, gray-700). Nav-look popovers are not height-capped, so a select inside has room for its option list.
- `MenuPopover.Item` is a button row that does **not** close the panel, so it can be a nested popover's trigger. A `Menu.Item` inside a popover is a button that **does** close it.
- `forceMount` keeps a closed panel in the DOM, hidden (the table filter panels need it; `TableBody.tsx` looks for their closed markup). `container` picks where the panel is portaled.
- `MenuPopover.Anchor` (or `PopoverAnchor`) positions a panel against an element that isn't the trigger (`AsyncSearchBox.tsx`).

### Plain popovers

A panel with no menu rows (a column picker, search results, call settings, a breadcrumb switcher, a small form) is a plain `Popover` from `waldur-ui`:

```tsx
import { Popover, PopoverContent, PopoverTrigger } from 'waldur-ui';

<Popover>
  <PopoverTrigger asChild>
    <BaseButton iconNode={<GearIcon />} tooltip={translate('Toggle visible columns')} />
  </PopoverTrigger>
  <PopoverContent side="bottom" align="end" sideOffset={2} className="table-columns-popover">
    <ColumnsPopover … />
  </PopoverContent>
</Popover>
```

- `PopoverContent` is a bordered card with the dropdown shadow and an 8px radius on Bootstrap's popover layer (`z-popover`, 1070), and nothing else: no width, padding, height cap or motion, since every panel lays out its own content. Add them as classes, e.g. `max-h-(--radix-popover-content-available-height) overflow-y-auto` for a panel that may outgrow the screen, or `animate-[waldur-menu-enter-up_0.3s_ease]` for the menus' entrance.
- Another layer is a `z-*` class: `z-header-popover` for panels opened from the header (`SearchToggle.tsx`, `DropdownBreadcrumbItem.tsx`), `z-dropdown-menu` to stack like the action menus.
- `container` picks where the panel is portaled (`CallSettingsMenu.tsx`); `PopoverAnchor` positions it against an element that isn't the trigger (`AsyncSearchBox.tsx`, `SearchToggle.tsx`).
- A searchable list of links inside a popover (the breadcrumb switchers) is a `cmdk` combobox: the search box keeps focus while the arrow keys highlight the rows, which are `Command.Item asChild` around their `Link`, and Enter opens one. Reuse `BreadcrumbDropdown`, mapping each result to the page it opens with `getItem`, rather than a list of links you Tab through; the `Navigation/BreadcrumbDropdown` stories show every state and key.
- The panel closes on any click or focus outside it. The `waldur-ui` selects inside need no special case, although they portal their option lists to `document.body`: Radix counts events from React portals opened inside the panel as inside it.

A form with a react-bootstrap `Card` of its own lets the `Card` draw the panel (`MarketplaceLandingFilter.tsx`):

```tsx
<PopoverContent
  align="end"
  sideOffset={2}
  aria-labelledby="my-filter-toggle"
  className="z-dropdown-menu min-w-400px border-0"
>
  <Card>…</Card>
</PopoverContent>
```

### Filtering resource actions

```tsx
import { ActionList } from '@/marketplace/resources/actions/ActionList';

<ActionList hideNonImportant hideGroupName>
  <ActionsList {...resource} refetch={refetch} />
</ActionList>;
```

`ActionList` takes `query` (label substring, case-insensitive), `hideDisabled`, `hideNonImportant` and `hideGroupName` (hides `ActionGroup` captions). Each `ActionItem` inside checks itself with `isActionVisible`, because the actions are components that only know their label and state when rendered. Used by the resource quick actions (`ActionsPopover.tsx`) and the "show all actions" dialog (`ActionDialogBody.tsx`), where the rows render as plain buttons since there is no menu around them.

---

## How it works

### Built-in defaults

`Menu` and `MenuPopover` set these, so call sites don't:

- `modal={false}`: a click on another trigger opens that menu directly, and the page keeps scrolling.
- A Portal to `document.body` (or `container`), with the look's z-index layer (`z-nav-menu`, `z-dropdown-menu`).
- Scrolling inside the space Radix measures between the trigger and the viewport edge, instead of running off-screen.
- `sideOffset={2}`, and Metronic's entrance (fade and slide, 0.3s) on nav panels, off under `prefers-reduced-motion`.

### Looks

| Look      | Where                                                 | Panel                                                                    | Rows                                                      |
| :-------- | :---------------------------------------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------------- |
| `nav`     | header, page tabs, footer, filter and picker popovers | no border, page background, 8px radius, dropdown shadow                  | gray-600, 10×16px, highlight on gray-50                   |
| `actions` | row actions, "Add" and toolbar menus                  | page background, 8px radius, 6.5px vertical padding, 130px minimum width | gray-700, 14px, weight 500, 10×16px, highlight on gray-50 |
| `card`    | popovers with their own layout (`MenuPopover` only)   | 1px border, card background, dropdown shadow, no padding                 | none: the content lays itself out                         |

The looks were measured against the Metronic and Bootstrap menus they replaced. Colours come from the `--menu-*` tokens in `packages/design-tokens/src/surfaceColors.css` (light and dark), the shadow from `--dropdown-shadow`. `packages/ui/src/Menu/menuLooks.test.ts` snapshots every class set, so a change there is a visible change: update the snapshot only on purpose.

### Row options (nav look)

| Option    | Values                                                                                                 |
| :-------- | :----------------------------------------------------------------------------------------------------- |
| `density` | `default` (10×16px), `compact` (8×9.75px: the footer, BoxRadioField), `base` (8×12px: filter popovers) |
| `tone`    | `default` (gray-600), `strong` (gray-700)                                                              |

Set them on the panel: `<Menu.Content density="compact">`, `<MenuPopover.Content tone="strong">`. They are plain CSS: the panel is a `group/menu` carrying `data-density` / `data-tone`, and the row classes include group variants for them. A submenu is portaled out of its parent panel, so it doesn't inherit them; give `Menu.SubContent` its own.

A row is highlighted, gray-700 on gray-50 (the `menu-row-active:` variant in `packages/design-tokens/src/variants.css`), when it is hovered, keyboard-highlighted (`[data-highlighted]`), an open submenu's trigger (`[data-state=open]`), the checked radio row (`[data-state=checked]`) or the current page (`.active`). Disabled rows never are.

### Look and kind travel through context

Radix portals every panel and submenu to `document.body`, so CSS inheritance never reaches a submenu's rows. Each panel therefore puts two things into React context (`MenuLookProvider`), and rows read them:

- the **look** (`nav` or `actions`),
- the **kind** of container: `menu` (`Menu.Content`, `Menu.SubContent`), `popover` (`MenuPopover.Content`), or `plain` when there is no panel at all.

`Menu.Item` renders for its kind:

| Kind      | Renders                                         | Closes on select?                       |
| :-------- | :---------------------------------------------- | :-------------------------------------- |
| `menu`    | a Radix menu item (`<div role="menuitem">`)     | yes, unless `onSelect` prevents default |
| `popover` | a `<button role="menuitem">` in `Popover.Close` | yes, unless `onSelect` prevents default |
| `plain`   | a plain `<button>` (no menu, so no menu item)   | nothing to close                        |

That is why one row component works in a menu, a popover and a dialog list. A Radix menu item outside a menu would throw.

For an element that must look like a row without being one (a custom picker row), take the classes from the context: `const className = useMenuItemClassName();` (`SupportMenu.tsx`, `RoleAndProjectSelectField.tsx`).

---

## Pitfalls

- **Default alignment.** Radix's `align` defaults to `center`. Menus that grew from a trigger's start edge must say `align="start"`.
- **Which side.** `ActionsMenu` (and `ActionsDropdown`) open to the left, aligned to the start; pass `side="bottom"` for a menu under a toolbar or "Add" button. `Menu` panels default to `side="bottom"`. A submenu's side is chosen by Radix (right, flipping left near the edge); only its `align` is yours.
- **Bootstrap `!important` utilities.** In the main app, Bootstrap spacing classes (`py-4`, `p-0`, `mb-2`) are `!important` and beat Tailwind spacing. The menu surfaces reset their own spacing with `m-[0px] p-[0px]`, not `m-0`/`p-0`, for that reason. Prefer one system per property on a panel.
- **tailwind-merge and `text-anchor`.** `cn()` reads `text-anchor` and `text-primary` as two colours and drops the first. Put such classes on the `asChild` child, where Radix's Slot joins class names without merging (`ResourceAccessButton.tsx`).
- **`Link` and plain strings.** The app's `Link` gives a bare string child the `text-anchor` link style, which replaces the row colour. `NavMenuLink` wraps the label in a `<span>` for this reason; do the same if you compose `Link` yourself.
- **Hover-opened menus and clicks.** A click on a trigger that hover already opened would close it twice over (trigger toggle, outside press). `openOnHover` handles this; don't wire hover by hand.
- **Disabled rows** take no pointer events, so a tooltip explaining why goes next to the row (`ActionItem`'s `tooltip` renders a question icon beside it), not on it.

---

## Testing

- **Unit tests (jsdom).** Render menus open by clicking their trigger with `userEvent`, then query `screen` (panels are portaled). `inActionsMenu(children)` from `src/test/harness.tsx` wraps action rows in an open `<Menu.Content look="actions">`, so they render as real menu items without a table. The test setup provides `window.matchMedia` (no query matches, i.e. desktop); stub it with `vi.stubGlobal('matchMedia', …)` to test `openOnHover="desktop"` below `lg`. jsdom can't check positioning, hover or computed colours.
- **Story tests (Chromium).** `npx vitest run --project storybook <file>` runs a story's `play` function in a real browser: use it for hover, keyboard navigation, focus return and computed styles. Rows fade their colours over 200ms and panels fade in, so wrap style and visibility checks in `waitFor`. A story that shows several panels open at once passes `onOpenAutoFocus` and `onInteractOutside` handlers that `preventDefault()`, or each panel closes the others (see `STAY_OPEN` in `Menu.stories.tsx`).
- **E2E hooks.** Panels and rows carry roles (`menu`, `menuitem`, `menuitemradio`); action menus add `data-testid="actions-menu"`, `"action-item"` and `"actions-toggle"`; the kebab's accessible name is "Actions". The full mapping is in [E2E Locators](e2e-locators.md).

---

## Changing the system

- **A new option or look** belongs in the cva recipes collocated with its component in `packages/ui/src/Menu/` (with a snapshot update in `menuLooks.test.ts`) and, if rows need it, in `MenuRowOptions` in `packages/ui/src/Menu/menuContext.tsx`. Measure it in the running app in light and dark mode, and add it to the `Overlays/Menu` stories.
- **A new part** belongs in `packages/ui/src/Menu/Menu.tsx` as a member of `Menu` or `MenuPopover`, reading the look and kind from context like the existing ones, with a test in `packages/ui/src/Menu/Menu.test.tsx` or `MenuPanels.test.tsx`.
- **App-specific behaviour** (translations, router links, toggles with app icons) stays in `src/`, on top of the `waldur-ui` parts.

---

## Background

HomePort used to have three menu systems: Metronic `menu-*` classes for the header, tabs and footer; Bootstrap `dropdown-*` classes for action menus; and a shadcn-style `DropdownMenu` in `packages/shell`. Each wrapped Radix on its own (five panel wrappers, three placement APIs, four row components chosen by a `notInMenu` flag). The Metronic and Bootstrap CSS was ported to Tailwind and deleted (see the Legacy Menu CSS Retirement and Legacy Dropdown CSS Retirement sections in [tailwind-shadcn-migration-notes.md](tailwind-shadcn-migration-notes.md)), and then the components were consolidated into the parts above (waldur/waldur-homeport!7711). The git history of this file holds the step-by-step migration plan.

The [rule](#rules) against importing Radix directly is enforced: `no-restricted-imports` in `eslint.config.js` rejects `@radix-ui/react-dropdown-menu` and `@radix-ui/react-popover` outside `packages/ui`. The one exception is `src/form/InsertLinkPopover.tsx`, a port of MDXEditor's own link dialog (styled by MDXEditor's CSS, with a popover arrow), marked with an `eslint-disable-next-line` comment that gives the reason.
