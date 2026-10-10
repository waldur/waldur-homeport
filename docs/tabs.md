# Tabs

Every tab bar in HomePort is built from `waldur-ui` primitives (`Tabs`, `TabNav`) or from a wrapper over them (`EmbeddedTabs`, `TableWithTabs`, `TableNav`, `TabbedSection`). The Bootstrap/Metronic `.nav` stylesheet and react-bootstrap's `Tab`, `Tabs` and `Nav` are gone, and the `waldur-custom/no-bootstrap-tabs` lint rule keeps them out (see [Lint rule](#lint-rule)).

## Choosing a tab component

| The tab bar…                                                            | Use                                                                               |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| switches panels held on the page, state-driven                          | `Tabs` + `TabsList` / `TabsTrigger` / `TabsContent`                               |
| changes the URL; the router draws the panel (no panels here)            | `TabNav` with link `items`                                                        |
| switches panels that are tables, in an expandable row or a card section | `EmbeddedTabs` (`@/table/EmbeddedTabs`)                                           |
| shares one card header and toolbar between several tables               | `TableWithTabs` (see [layout-wrappers](table/layout-wrappers.md))                 |
| is a table's own router-driven sub-navigation (`tabs` prop of `Table`)  | `TableNav` (formerly `TableTabs`), a `TabNav`                                     |
| groups form fields into URL-synced, searchable sections                 | `TabbedSection` (see [forms.md](forms.md))                                        |
| is a segmented bar over a few large panels (e.g. the sign-in method)    | `Tabs` with `TabsList variant="segmented"`, see [Segmented tabs](#segmented-tabs) |
| is a two-or-three-way view switch rather than tabs of content           | `SegmentedControl` (see [a11y-decision-matrix.md](a11y-decision-matrix.md))       |

The rule of thumb: if clicking changes the URL, the items must stay real links, so use `TabNav`; if it only changes what the page shows, use `Tabs`.

## `Tabs`

Radix Tabs with HomePort's look. Import everything from `waldur-ui`.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'waldur-ui';

<Tabs mount="active" defaultValue="details">
  <TabsList className="mb-4">
    <TabsTrigger value="details">{translate('Details')}</TabsTrigger>
    <TabsTrigger value="events" disabled={!canSeeEvents} tooltip={reason}>
      {translate('Events')}
    </TabsTrigger>
  </TabsList>
  <TabsContent value="details">…</TabsContent>
  <TabsContent value="events">…</TabsContent>
</Tabs>;
```

| Prop                      | Notes                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `value` / `onValueChange` | Controlled. Values are strings, and so are `TabNav` and `TableTab` keys.                                                                      |
| `defaultValue`            | Uncontrolled. Unlike react-bootstrap, nothing is open until you set it, so pass the first tab's key.                                          |
| `mount`                   | `'active'` (default), `'visited'` or `'all'`. See below.                                                                                      |
| `activationMode`          | `'automatic'` by default (arrow keys select, as Bootstrap tabs did). Pass `'manual'` to move focus with the arrows and select on Enter/Space. |
| `TabsTrigger` `tooltip`   | Works on disabled triggers too (the tooltip trigger wraps the button).                                                                        |
| `TabsTrigger` `hint`      | Help text: the tooltip (unless `tooltip` is set) plus a question-mark icon. Use it instead of a `HelpIcon`, which can't sit inside the tab.   |
| `TabsTrigger` `count`     | A count badge after the title; `countLoading` shows a spinner in it instead. `undefined` shows no badge, `0` shows `0`.                       |
| `TabsList` `variant`      | `'line'` (default) or `'segmented'`; `fullWidth` stretches a segmented row.                                                                   |
| `TabsList` `bordered`     | `false` drops the strip's own bottom line, for a strip in a card header that already draws one. `TabNav` takes it too.                        |

### Data form

Pass `items` and `Tabs` draws the strip and the panels itself, the way `TabNav` takes `items`. Prefer it whenever the tabs come from an array or a conditional list:

```tsx
<Tabs
  defaultValue="details"
  listProps={{ className: 'mb-4' }}
  items={[
    { value: 'details', title: translate('Details'), content: <Details /> },
    {
      value: 'events',
      title: translate('Events'),
      count: events.length,
      hidden: !canSeeEvents,
      content: <Events />,
    },
  ]}
/>
```

An item takes `value`, `title`, `content` and the trigger props (`count`, `countLoading`, `hint`, `tooltip`, `disabled`), plus `hidden` to leave it out, `className` (trigger) and `contentClassName` (panel). `listProps` go to the generated `TabsList`, `panelsClassName` wraps the panels in a div, and `children` render above the strip (a title row).

The open tab falls back to the first visible, enabled item when none is chosen, or when the chosen one is hidden, disabled or goes away later, so the bar never opens on an empty panel. The rule is `resolveTabValue(selectable, requested)` from `waldur-ui`, which `useUrlTab` uses too.

### Mount modes

`TabsContent` decides whether an inactive panel exists in the DOM. Pick the mode that matches what each panel does, because a mounted panel runs its effects and fetches:

| `mount`     | Behaviour                                                   | react-bootstrap equivalent       |
| ----------- | ----------------------------------------------------------- | -------------------------------- |
| `'active'`  | Only the open panel is mounted; leaving a tab unmounts it.  | `mountOnEnter` + `unmountOnExit` |
| `'visited'` | A panel mounts when first opened and stays mounted, hidden. | `mountOnEnter`                   |
| `'all'`     | Every panel is mounted up front and hidden with `hidden`.   | the default (no flags)           |

Use `'all'` when state must survive a tab switch or panels must be ready (forms, a chat connection). To keep just one panel alive in an `'active'` group, give its `TabsContent` `forceMount`. Radix itself would then render that panel visible even when inactive, so `TabsContent` hides it for you (`hidden` plus the `hidden` class) while keeping it mounted.

## `TabNav`

For bars whose panel is drawn elsewhere by the router. It renders a `<nav>` (named "Tabs" unless you pass `aria-label`) with `aria-current="page"` on the active link, not `role="tab"` with orphan `aria-controls`.

**Don't use `TabNav` to switch panels held on the page**, even if the bar looks the same: that is `Tabs`. A `TabNav` there loses `role="tab"`/`tabpanel`, `aria-selected` and arrow-key navigation, and claims a "current page" that does not exist.

`TabNav` takes its tabs as data, like the `items` form of `Tabs`; there are no item components to compose.

**Items are links.** Give a navigating item `link: <Link state="…" params={…} />` so the tab stays a real anchor: middle-click, Ctrl/Cmd-click, "open in new tab" and the URL preview all work. `TabNav` replaces the link's children with the item's `title` (in a span, so a string title doesn't pick up Metronic's `.text-anchor`) and asserts the tab colours over the global `a { color }` rule. Don't navigate with `onSelect` + `router.stateService.go(...)`: that makes the tabs buttons.

```tsx
import { TabNav } from 'waldur-ui';
import { Link } from '@/core/Link';

<TabNav
  activeKey={state.name}
  listClassName="mb-4"
  items={[
    {
      key: 'project.dashboard',
      title: translate('View'),
      link: <Link state="project.dashboard" params={{ uuid }} />,
    },
    {
      key: 'project-manage',
      title: translate('Edit'),
      link: <Link state="project-manage" params={{ uuid }} />,
      disabled: !canEdit,
      tooltip: reason,
    },
  ]}
/>;
```

| Item field          | Notes                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`               | Matched against `activeKey`; using the state name lets `activeKey={state.name}` mark the current tab.                                                    |
| `active`            | Overrides the match, for a looser one (`active: router.stateService.includes(tab.state)`).                                                               |
| `link`              | The anchor the tab renders as. Without it the tab is a `<button>`.                                                                                       |
| `onClick`           | Button tabs only. `TabNav`'s `onSelect(key)` runs after it. A link tab gets no click handler, since a router `Link` with one turns into `role="button"`. |
| `disabled`          | A disabled link drops out of the tab order and ignores the pointer; a disabled button is `disabled`. `tooltip` still shows on both.                      |
| `tooltip`, `testId` | A tooltip on the tab; `data-testid` on it.                                                                                                               |

`TabNav` itself takes `activeKey`, `onSelect`, `aria-label`, and for the strip `listClassName`, `bordered`, `scrollable` and `scrollClassName`. A link tab is marked `aria-current="page"`; a button tab `aria-current="true"` (the current item of a set, not a page). Button tabs are for `TableNav`' local-state mode and for disabled placeholders.

## Keeping the tab in the URL

`useUrlTab(tabs, param)` (`@/navigation/useUrlTab`) holds the open tab of a `Tabs` bar in a query param, falls back to the first tab for a missing or unknown value or a tab that went away, and follows Back/Forward. Without `param` it is plain local state. `TableWithTabs` (`syncWithUrlKey`) and `TabbedSection` use it; declare the param `dynamic` on the route (see Gotchas).

```tsx
const { activeKey, handleSelect } = useUrlTab(tabs, 'tab');

<Tabs value={activeKey} onValueChange={handleSelect}>
  …
</Tabs>;
```

## `EmbeddedTabs`

Tabs embedded in another surface, an expandable row or a card section, whose panels are tables or row details: the data form of `Tabs` with the strip and table-card styling those places share. (Formerly `PanelTabs`.) Only the open panel is mounted, so only its table fetches. Every expandable row with tabs uses it.

```tsx
import { EmbeddedTabs } from '@/table/EmbeddedTabs';

<EmbeddedTabs
  framed
  defaultValue="projects"
  className="min-h-375px"
  tabs={[
    {
      key: 'projects',
      title: translate('Projects'),
      count: projectsCount.data,
      countLoading: projectsCount.isLoading,
      content: <SummaryProjects customer={row} />,
    },
    {
      key: 'team',
      title: translate('Team'),
      hidden: !canListUsers, // replaces `cond && <Tab…>`
      content: <SummaryTeamTable scope={row} context="organization" />,
    },
  ]}
/>;
```

| Field / prop                 | Notes                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `count`, `countLoading`      | Passed to `TabsTrigger` (see above). Pass `?? 0` if a missing count should read `0`.                 |
| `hidden`                     | Leaves the tab out entirely.                                                                         |
| `framed`                     | Frames the strip like the card of an expandable row. Set it for rows inside `ExpandableContainer`.   |
| `defaultValue` / `value`     | Optional. A missing or `hidden` choice falls back to the first visible tab, so no panel opens empty. |
| `header`                     | A title row above the strip. The strip then draws no frame of its own.                               |
| `className`, `listClassName` | On the root and on the strip.                                                                        |
| `value` / `onValueChange`    | Controlled mode, e.g. when a toolbar must follow the open tab (`OrganizationExpandableRow`).         |

A table card directly inside a panel sits flush under the strip (no top border or top radius), so don't add your own.

Reference: `src/user/affiliations/OrganizationExpandableRow.tsx` (controlled, framed), `src/marketplace/resources/projects/ResourceProjectExpandable.tsx` (with a header), `src/proposals/team/TeamSection.tsx` (conditional tabs in a card).

## Segmented tabs

For the segmented look (connected, button-like segments) over a few large panels, give `TabsList` `variant="segmented"`; `fullWidth` stretches the row. The triggers pick the look up from the list. `src/auth/SigninForm.tsx` is the example in the app:

```tsx
<Tabs value={method} onValueChange={setMethod} className="w-100 mb-5">
  <TabsList
    variant="segmented"
    fullWidth
    aria-label={translate('Sign in method')}
  >
    <TabsTrigger value="username">{translate('Username')}</TabsTrigger>
    <TabsTrigger value="token">{translate('Access token')}</TabsTrigger>
  </TabsList>
  <TabsContent value="username">…</TabsContent>
  <TabsContent value="token">…</TabsContent>
</Tabs>
```

Use this instead of `SegmentedControl` whenever each option owns a distinct, large panel. Real tabs emit `role="tablist"`, `role="tab"` and `role="tabpanel"` with `aria-controls` links, and assistive technology announces "Tab 1 of 2" and can jump into the active panel; a `SegmentedControl` is a radio group with none of that. Give the list an `aria-label`.

## Look and tokens

- The line tab matches the metrics of the old Metronic `.nav-line-tabs`: 14px semibold text, `4px 4px 10px` padding, a 1px list border and a flat 2px indicator, with a gap of `1.23rem` between tabs.
- Colours come from the `--tabs-*` tokens in `packages/design-tokens/src/tabColors.css` (light and dark). Change them there; don't hard-code colours at call sites.
- Every state keys off `data-state`, which both `TabsTrigger` and `TabNav` set. Hover touches only an inactive, enabled tab and uses neutral colours (`--tabs-text-hover`, `--tabs-indicator-hover`), so a hovered tab never looks selected. Disabled keys off `aria-disabled`, which anchor tabs carry too.
- A `scrollable` strip scrolls the active tab into view when it changes (sideways only, never the page), so a deep link to a late tab does not open with it off-screen.
- The indicator is a bottom border on the trigger with `-mb-px`, so it overlaps the list border. That 1px overhang is **clipped by any `overflow` container**, which shows up as a vertical scrollbar or a missing underline. Don't wrap a strip in your own scroll container; give the list `scrollable` (`TabsList`, or `TabNav` itself) and it supplies a frame that keeps the underline whole:

  ```tsx
  <TabsList scrollable scrollClassName="flex-grow-1">…</TabsList>
  <TabNav items={items} scrollable className="min-w-0 flex-grow-1" />
  ```

  `scrollClassName` is for layout on the frame (`flex-grow-1`); `className` stays on the list. When the strip sits in a card header that already draws the bottom line (`TableNav`, `ReviewerProfilePanel`, `AccessControlTabsContainer`), also give the list `bordered={false}` so there is only one line. Don't try to cancel the frame's `pb-px` with `-mb-px`; it clips the underline.

- The keyboard focus ring is **inset** (`ring-inset`), drawn inside the trigger's own box. An offset ring sits outside the tab and is clipped by the scroll frame's `overflow`, which cut off its top and left edges.
- Count badges inside tabs are ordinary `Badge`s and keep their own variant colours. The old rule that tinted them brand-coloured on the active tab was removed.

## Gotchas

- **Bootstrap utilities are `!important` and sit in a lower layer, but they still win.** `border`, `border-0`, `border-x-0`, `border-start-0` and similar Bootstrap classes override Tailwind's, because important declarations in an earlier layer beat important ones in a later layer and any normal declaration. When you need a specific border width on a tab strip, use arbitrary values (`border-[1px]`, `border-x-[0px]`), which have no Bootstrap counterpart. `border-0` is fine when you _want_ Bootstrap's behaviour (no border at all).
- **Anchor tabs and colour.** Give a `TabNav` item a `link`; don't style a bare `<a>` as a tab.
- **Card bodies in a tab panel keep their top padding.** `_table.scss` drops the top padding of a table card's body, except inside a tab panel. It keys off `[role="tabpanel"]`, which every `TabsContent` has, so no wrapper class is needed; the older `.tab-content` hook still works where it is set by hand. Use `[role="tabpanel"]` in new CSS.
- **Tab and search params must be `dynamic` in the route.** A tab bar that keeps its state in the URL (`?tab=…`, `useUrlTab`, `TableWithTabs syncWithUrlKey`) writes it with `router.stateService.go(...)`. If the route does not declare the param `dynamic`, UI-Router exits and re-enters the state on every change, so the whole page remounts on each tab switch (and a `?q=` search box loses focus on every keystroke). Declare it once on the route:

  ```ts
  { name: 'admin-features', url: 'features/?tab&q',
    params: { tab: { dynamic: true }, q: { dynamic: true } }, … }
  ```

  The `waldur-custom/dynamic-tab-params` rule enforces this for query params named `tab`, `q`, `*_tab` and `*Tab` in route files, and `eslint --fix` adds the missing entry.

  **Don't make every param dynamic.** `dynamic` only helps a param the page rewrites with `stateService.go` on the _same_ state while it is mounted, and only if the page reads that param reactively (`useCurrentStateAndParams`, `useUrlTab`). Leave it alone when:

  - the page reads it **once at mount** (`useState(params.mode)`), because a remount is what picks up a new value. The reporting analytics routes' `?mode` is the example: made dynamic, a deep link to another mode would leave the page stale;
  - it is a **table filter**, because filters are written with `router.urlService.url(...)` (`src/core/filters.ts`), which updates the URL without a state transition, so the page never remounts for them;
  - it is only set **on entry** (`?token=…`, `?review_uuid=…`, links from other pages).

  The rule is limited to `tab`, `q` and `*_tab` / `*Tab` for that reason. A tab bar driven by another param name (the call lists use `?state`) has to be declared dynamic by hand, after checking that the page reads the param reactively.

- **Panels are mounted according to `mount`**, so a hidden panel under `'all'` still runs its effects. A test that looks for text in a closed panel needs `mount="all"` or to open the tab first.
- **Query by role in tests**: `getByRole('tab', { name })` for `Tabs`, `getByRole('link', { name })` for `TabNav` link tabs and `getByRole('button', { name })` for its button tabs. `aria-selected` marks the open `Tabs` trigger; `aria-current="page"` marks the current link and `aria-current="true"` the current button.
- **No controls inside a trigger.** A `HelpIcon`, button, link or input inside a tab's button is invalid HTML and muddles the tab's name. Use `hint`, `tooltip` or `count`; `waldur-custom/no-interactive-in-tab-trigger` reports the rest in `TabsTrigger`. `TabNav` titles are data, so keep controls out of them too.
- **Don't reach into the DOM by class.** `.nav-item`, `.nav-link` and `.active` no longer exist on tab bars; measure or select `[role="tab"]` instead.

## Migrating old code

| Bootstrap                                        | Now                                                              |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `Tab.Container activeKey onSelect`               | `Tabs value onValueChange`                                       |
| `defaultActiveKey`                               | `defaultValue` (string)                                          |
| `unmountOnExit` / `mountOnEnter` / neither       | `mount="active"` / `"visited"` / `"all"`                         |
| `Nav variant="tabs" className="nav-line-tabs …"` | `TabsList` (or `TabNav`'s `listClassName`); keep only the extras |
| `Nav.Item` + `Nav.Link eventKey`                 | `TabsTrigger value` (or a `TabNav` item); drop the `Nav.Item`    |
| `Tab.Content` / `Tab.Pane eventKey`              | a plain `div` / `TabsContent value` (or the `items` data form)   |
| `<Tabs><Tab eventKey title>…</Tab></Tabs>`       | `Tabs` + `TabsList` of triggers + `TabsContent` panels           |
| bar with no `Tab.Pane` (router-driven)           | `TabNav` with link `items`                                       |
| table panels in an expandable row                | `EmbeddedTabs`                                                   |

## Lint rule

`waldur-custom/no-bootstrap-tabs` (error) reports react-bootstrap `Tab`, `Tabs`, `Nav` and their parts, `Navbar` and `NavDropdown`, by named or deep-path import, and any `nav`, `nav-item`, `nav-link`, `nav-tabs`, `nav-pills`, `nav-line-tabs` (and similar) class token, since those classes no longer style anything. `.tab-content` and `btn-nav-item` are allowed. It also reports `@radix-ui/react-tabs` imported outside `waldur-ui`'s own Tabs. `waldur-custom/no-interactive-in-tab-trigger` (error) reports a `HelpIcon`, button, link or form control inside a `TabsTrigger`. A third rule, `waldur-custom/dynamic-tab-params`, covers route definitions (see the Gotchas section).
