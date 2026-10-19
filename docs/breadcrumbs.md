# Breadcrumbs

Every breadcrumb trail is built from `waldur-ui`: `BreadcrumbTrail` for a page's trail, `BreadcrumbsProvider` and `useBreadcrumbs` to set it from the page, and the `Breadcrumb*` primitives for anything custom. Nothing in it knows about a router, so the root app and every micro-app under `apps/*` use the same components. The Bootstrap/Metronic `.breadcrumb` stylesheet and react-bootstrap's `Breadcrumb` are gone, and the `waldur-custom/no-bootstrap-breadcrumb` lint rule keeps them out.

Stories: `Navigation/BreadcrumbTrail`, `Navigation/Breadcrumb` and `Data Display/MiddleTruncate` in Storybook. Their `play` functions run in Chromium and cover the layout and keyboard behaviour described below.

## Choosing a component

| You need…                                                      | Use                                                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| a page's trail in the root app header                          | `useBreadcrumbs(items)` from the page (the header draws it)                                                                                       |
| a trail in a micro-app or anywhere you hold the items yourself | `<BreadcrumbTrail items={…} />`                                                                                                                   |
| a trail fed by pages, with routing, outside the root app       | `BreadcrumbsProvider` + `useBreadcrumbs` + `<BreadcrumbTrail />`                                                                                  |
| a one-off trail with its own markup (no collapse, no menus)    | the primitives: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis` |
| the middle of a long name truncated anywhere else              | `MiddleTruncate`                                                                                                                                  |

## Setting a page's crumbs

A page passes its crumbs to `useBreadcrumbs`; they show while the page is mounted and clear when it unmounts.

```tsx
import { IBreadcrumbItem, useBreadcrumbs } from 'waldur-ui';

const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
  () => [
    getOrganizationsBreadcrumbItem(),
    getOrganizationBreadcrumbItem({
      uuid: project.customer_uuid,
      name: project.customer_name,
    }),
    getOrganizationProjectsBreadcrumbItem(project.customer_uuid),
    {
      key: 'project',
      text: project.name,
      dropdown: (close) => (
        <ProjectBreadcrumbPopover project={project} close={close} />
      ),
      truncate: true,
      active: true,
    },
  ],
  [project],
);
useBreadcrumbs(breadcrumbItems);
```

- **Memoise the items.** A new array on every render re-sets the trail, and the trail starts expanded and re-measures whenever its items change.
- **Reuse the presets.** `usePresetBreadcrumbItems()` (`src/navigation/header/breadcrumb/utils.ts`) builds the organization, organizations, organization projects and project crumbs, including the permission check that turns an organization the user can't open into plain text, and the resource-filter sync on click. Pass a second argument to override fields.
- **Without a provider** (a unit test, a micro-app without a trail), `useBreadcrumbs` does nothing instead of throwing.

## `IBreadcrumbItem`

| Field               | Notes                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `key`               | Unique within the trail.                                                                                                    |
| `text`              | The label. A string: the trail measures and truncates it.                                                                   |
| `to`, `params`      | Where the crumb links, in the router's terms: see [Routing](#routing). Omit for a crumb that isn't a link.                  |
| `onClick`           | With `to`: runs alongside the navigation. Without: the crumb is a button.                                                   |
| `active`            | The current page: not a link, marked `aria-current="page"`, and [middle-truncated](#layout) to fit. Usually the last crumb. |
| `dropdown`          | Content of a popover the crumb opens: a node, or `(close) => node` to close it from inside (after picking an item).         |
| `hideDropdownArrow` | Drops the caret next to a dropdown crumb.                                                                                   |
| `truncate`          | Caps the label at 320px with an end ellipsis; `tooltipText` (or the text) becomes its `title`.                              |
| `maxLength`         | Shortens a label more than five characters over it to this many (`Norther...ortium`), with the whole text in a tooltip.     |

A crumb with neither `to`, `onClick` nor `active` is plain text, for a level the user can't open.

## Routing

The trail turns a crumb's `to` and `params` into a link through the `renderLink` of the nearest `BreadcrumbsProvider`, or a `renderLink` prop on the trail itself. It fills the returned element with the crumb's content and classes.

```tsx
// Root app (src/navigation/Layout.tsx): `to` is a UI-Router state name.
const renderStateLink: BreadcrumbLinkRenderer = (to, params) => (
  <Link state={to} params={params} />
);
<BreadcrumbsProvider renderLink={renderStateLink}>…</BreadcrumbsProvider>;

// A React Router app: `to` is a path.
<BreadcrumbsProvider renderLink={(to) => <RouterLink to={to} />}>
```

Without a `renderLink`, `to` is used as a plain `href`.

- **Return the link empty and without an `onClick`.** The trail supplies the content, and attaches the crumb's `onClick` in the capture phase: the app's `Link` turns into `role="button"` when it is given an `onClick`.
- The root app's `Link` also hides links to states this deployment has switched off, so a crumb pointing at one renders as text.

## Dropdowns

Any crumb can open a popover: a project switcher on the current crumb, an organization switcher on a linked one. The trail owns the popover and its keyboard and focus handling; the content is the app's.

In the root app the content is usually a `BreadcrumbDropdown` (`src/navigation/header/breadcrumb/BreadcrumbDropdown.tsx`): a searchable list of links built from an API list call, with filters and favourites. `src/project/ProjectBreadcrumbPopover.tsx` is the reference. It is not in `waldur-ui` because it depends on the app's API client, forms and favourites; a micro-app passes its own content.

The popover is non-modal (the page stays clickable while it is open), portaled to `<body>`, and stacks at `z-header-popover`.

## Layout

The trail is one line that always fits its container:

1. Leading crumbs keep their natural width. A `truncate` crumb is capped at 320px.
2. The last crumb shrinks. When it is the `active` one, its text middle-truncates (`Quantum Error Corr…ulations (Create)`) with `MiddleTruncate`, so the end of a long resource name stays readable.
3. When the leading crumbs don't fit either, everything between the first and the last folds into a `...` crumb whose popover lists them. The trail expands again once there is room for the whole of it, and starts expanded whenever its items change.
4. A trail of one crumb reads "Go back to …" with a back caret.

This needs a width-constrained parent: the trail's container must be a flex item that can shrink (`min-w-0`), which the root app's header provides. The collapse is measured with a `ResizeObserver` on the list, so it follows the container, not the window.

## Accessibility and keyboard

- The trail is `<nav aria-label="breadcrumb">` with an `<ol>`; separators are `aria-hidden`.
- The current page carries `aria-current="page"` once: on its text, or on the crumb itself when the crumb is a switcher.
- `MiddleTruncate` hides the head/tail fragments from assistive technology and announces the whole name once.
- **Dropdown crumbs:** the current crumb's label is the trigger (`role="button"`, in the tab order), so its focus ring doesn't include the separator. Enter and Space open the popover on the keys the crumb's own control ignores: both on the current crumb, Space on a link (Enter follows it), neither on a button (it handles both itself).
- **Leaving the popover:** Escape closes it and returns focus to the crumb. Tab past its last item, or Shift+Tab before its first, closes it and returns focus too, instead of jumping to the end of the page where the panel is portaled. A click elsewhere closes it and leaves focus where the user clicked.

## Mobile

Below the `md` breakpoint the root app draws the trail in a fixed bar under the header (`BreadcrumbMain mobile`). That bar is still positioned by `.breadcrumb-mobile` in `src/metronic/sass/custom/_breadcrumb.scss` (also matched by `layout/_toolbar.scss` and `layout/_sticky-top.scss`). It is header layout, not breadcrumb styling, and moves with the header's own migration; the lint rule allows the class.

## Micro-apps

Use `BreadcrumbTrail` rather than copying anything from `src/navigation/header/breadcrumb/`. `apps/micro-app-poc/src/OrgDashboardMock.tsx` passes its crumbs straight to `<BreadcrumbTrail items={…} />`, with no provider and no router. Add a `BreadcrumbsProvider` once pages set their own crumbs, with a `renderLink` if the app has a router. See [micro-apps.md](micro-apps.md).

## Testing

- **Unit tests** render the trail in jsdom (`packages/ui/src/Breadcrumb/BreadcrumbTrail.test.tsx`). jsdom lays nothing out: to test the collapse, stub `Element.prototype.scrollWidth` and `ResizeObserver` as that file does, and use `to` as a plain href instead of mocking a router.
- **Layout and real keyboard behaviour** belong in the stories' `play` functions, which run in Chromium: give the story a fixed width so the overflow is deterministic (`BreadcrumbTrail.stories.tsx`'s `Frame`).
- In the root app, a page's crumbs are plain data: test the items its hook builds (as `src/navigation/header/breadcrumb/utils.test.tsx` does) rather than rendering the header.

## Migrating off Bootstrap

| Before                                                   | After                                                             |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| react-bootstrap `Breadcrumb` / `Breadcrumb.Item`         | `BreadcrumbTrail`, or the `Breadcrumb*` primitives                |
| `.breadcrumb`, `.breadcrumb-item`, `.breadcrumb-text`, … | nothing: those styles are deleted (the lint rule flags them)      |
| `LayoutContext`'s `breadcrumbs` / `setBreadcrumbs`       | `useBreadcrumbItems()` / `useBreadcrumbs(items)` from `waldur-ui` |
| `IBreadcrumbItem` from `@/navigation/types`              | `IBreadcrumbItem` from `waldur-ui`                                |
| `MiddleTruncate` from `@/core/MiddleTruncate`            | `MiddleTruncate` from `waldur-ui`                                 |
| `ellipsis: 'md' \| 'xl' \| 'xxl'` on an item             | nothing: the trail collapses by measured overflow                 |
