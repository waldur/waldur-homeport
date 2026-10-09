# E2E Locators

How the waldur-integration-testing Playwright suite finds HomePort's menus, tabs and filters: by roles, accessible names and `data-testid`, not by CSS classes.

## History

The suite used to locate these by Metronic menu and Bootstrap dropdown class names. When that CSS was deleted (see the Legacy Menu CSS Retirement section in [tailwind-shadcn-migration-notes.md](tailwind-shadcn-migration-notes.md)), HomePort kept rendering the class names, unstyled, while the suite moved over:

1. HomePort rendered both the legacy classes and the new hooks (waldur/waldur-homeport!7711).
2. The suite switched to the new hooks with the legacy class as a fallback (waldur/waldur-integration-testing!172).
3. HomePort stopped rendering the legacy classes.

Left to do: the suite can drop the legacy half of each selector in `tests/components/homeport_hooks.py`, plus the two page-tab fallbacks (`SecondaryToolbar.tab_items()` and `BaseResourcePage`'s toolbar), once the HomePort image it runs against includes step 3. Until then the fallbacks are harmless: they match nothing on new builds and still match older ones.

Removing a hook below breaks that suite without failing anything in HomePort, as removing the legacy classes too early did in integration pipeline 138738.

## Mapping

| Old selector                                           | New hook                                                                                                     | Before !7711?           |
| :----------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :---------------------- |
| `.dropdown-menu:visible`, `.dropdown-menu.show`        | `[data-testid="actions-menu"]`, or `get_by_role("menu")`                                                     | role yes, test id no    |
| `.dropdown-item`                                       | `[data-testid="action-item"]` (also `get_by_role("menuitem")`: every row has the role, inside a menu or not) | role partly, test id no |
| `.dropdown-toggle`                                     | `[data-testid="actions-toggle"]`; the icon-only kebab is also `get_by_role("button", name="Actions")`        | no                      |
| `.menu.menu-row` (page tab row)                        | `get_by_role("navigation", name="Page tabs")`                                                                | no                      |
| `.toolbar .menu-item` (a page tab)                     | `get_by_role("link", name=…)` or `get_by_role("button", name=…)` inside `.toolbar`                           | yes                     |
| `.menu-arrow` (tab with a submenu)                     | the tab's button has `aria-haspopup="menu"`                                                                  | yes                     |
| `.menu-sub:visible` (tab submenu)                      | `get_by_role("menu")`                                                                                        | yes                     |
| `.footer .menu-title`                                  | `get_by_role("link", name=…)` inside `.footer`                                                               | yes                     |
| `.table-filters-menu:not(.column-filter)`              | `get_by_role("dialog", name="Add filter")`                                                                   | yes                     |
| `#filter-item-<name> .menu-link`                       | `get_by_role("button", name=<filter title>)` inside that dialog                                              | yes                     |
| `.menu-content.filter-field`                           | `.filter-field`                                                                                              | yes                     |
| `[data-kt-menu-trigger='click']` (role picker trigger) | `[data-testid="role-project-select"]`, then `get_by_role("combobox", name="Role for <email>")`               | no                      |
| `.role-project-select-popup .menu-item`                | `get_by_role("option", name=…)`, not scoped to the row                                                       | no                      |

The role picker is two selects since waldur/waldur-homeport!7762: Role, then Project for a project-level role (`name="Project for <email>"`). Each is named after its row's email, or `Role for row <n>` while the email is empty. Their menus are portalled to `<body>`, so look up options on the page, not inside the row.
