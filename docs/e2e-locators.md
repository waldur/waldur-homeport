# E2E Locators

How the waldur-integration-testing Playwright suite finds HomePort's elements: by roles, accessible names, `data-testid` and `data-slot`, never by CSS classes. The suite keeps these selectors in `tests/components/homeport_hooks.py`. For when to add which attribute, see [class-names-and-data-attributes.md](class-names-and-data-attributes.md).

Removing or renaming a hook below breaks that suite without failing anything in HomePort. Move one in three steps, as the "Before you remove or rename" section of [class-names-and-data-attributes.md](class-names-and-data-attributes.md) describes.

## Hooks

| Element                                    | Hook                                                                                                       |
| :----------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| Page tabs row, with its actions            | `[data-testid="page-toolbar"]`                                                                             |
| Page tab row (navigation)                  | `get_by_role("navigation", name="Page tabs")`                                                              |
| A page tab                                 | `get_by_role("link", name=…)` or `get_by_role("button", name=…)` inside the page toolbar                   |
| Tab with a submenu                         | its button has `aria-haspopup="menu"`                                                                      |
| Tab submenu                                | `get_by_role("menu")`                                                                                      |
| Filter bar under the page tabs             | `[data-testid="filter-bar"]`                                                                               |
| Clear button on a filter badge             | `[data-testid="badge-right-icon"] button`                                                                  |
| App footer                                 | `[data-testid="app-footer"]`                                                                               |
| A footer link                              | `get_by_role("link", name=…)` inside the app footer                                                        |
| Open action menu                           | `[data-testid="actions-menu"]`, or `get_by_role("menu")`                                                   |
| Action menu row                            | `[data-testid="action-item"]`, or `get_by_role("menuitem")` (every row has the role, inside a menu or not) |
| Action menu toggle                         | `[data-testid="actions-toggle"]`; the icon-only kebab is also `get_by_role("button", name="Actions")`      |
| Table filter toggle                        | `get_by_role("button", name="Set filters")`                                                                |
| "Add filter" menu                          | `get_by_role("dialog", name="Add filter")`                                                                 |
| A filter in that menu                      | `get_by_role("button", name=<filter title>)` inside the dialog                                             |
| A filter's field                           | `[data-slot="filter-field"]`                                                                               |
| Router tab bar (page hero, table sub-tabs) | `nav[aria-label="Tabs"]` (`TAB_BAR`)                                                                       |
| A router tab                               | `get_by_role("link", name=…)`, or `"button"` for a disabled tab (`tab_item()`)                             |
| In-page section tabs                       | `[role="tablist"]` with `get_by_role("tab", name=…)` (`SECTION_TABS`)                                      |
| A dialog                                   | `get_by_role("dialog")`, filtered by name or text; its parts are `[data-slot="modal-body"]` and so on      |
| A dialog's close button                    | `get_by_role("button", name="Close")` inside the dialog                                                    |
| Invite dialog's role picker (one row)      | `[data-testid="role-project-select"]`, then `get_by_role("combobox", name="Role for <email>")`             |
| A role picker option                       | `get_by_role("option", name=…)`, on the page, not scoped to the row                                        |
| Sign-in callback error                     | the `"Login failed"` heading and its parent                                                                |
| Provider offering page body                | `[data-testid="provider-offering"]`                                                                        |
| Team chat: the open conversation           | `[data-testid="team-chat-conversation"]`                                                                   |
| A toast                                    | `[data-slot="toast"][data-variant="{status}"]`                                                             |
| A date field                               | `[data-slot="date-picker-input"]` (`DATE_INPUT`)                                                           |
| A select's parts (react-select)            | `.metronic-select__*`, allow-listed in `UNKNOWN_CLASS_HOOKS` in `eslint.config.js`                         |

## Notes

A router tab bar's `aria-label` defaults to "Tabs"; keep that default (or update `TAB_BAR`) when labelling a bar.

The role picker is two selects: Role, then Project for a project-level role (`name="Project for <email>"`). Each is named after its row's email, or `Role for row <n>` while the email is empty. Their menus are portalled to `<body>`, so look up options on the page, not inside the row.
