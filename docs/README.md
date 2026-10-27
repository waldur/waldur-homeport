# Developer Documentation Index

Guides for working on Waldur HomePort. Start with [development-setup.md](development-setup.md) if you are new to the codebase. The root `CLAUDE.md` file curates the most critical rules for day-to-day work.

## Getting started

| Guide                                              | Covers                                                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [development-setup.md](development-setup.md)       | Environment setup, essential commands, build tooling, browser debugging, i18n commands        |
| [development-workflow.md](development-workflow.md) | Planning, TDD, problem-solving approach                                                       |
| [architecture.md](architecture.md)                 | Redux store, UI-Router routing, component organization                                        |
| [code-quality.md](code-quality.md)                 | Linting, formatting, TypeScript checks                                                        |
| [testing.md](testing.md)                           | Vitest unit testing and E2E standards                                                         |
| [visual-testing.md](visual-testing.md)             | Visual regression: Storybook comparison, parity and geometry specs, CI screenshots, reporting |

## UI patterns

| Guide                                                                    | Covers                                                                                                                                       |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [component-library.md](component-library.md)                             | Reusable UI components: buttons, modals, tables, filters — with prop references                                                              |
| [tabs.md](tabs.md)                                                       | Tabs: `Tabs`, `TabNav`, `EmbeddedTabs`, mount modes, tokens, gotchas, migrating off Bootstrap `Nav`/`Tab`                                    |
| [breadcrumbs.md](breadcrumbs.md)                                         | Breadcrumbs: `BreadcrumbTrail`, `useBreadcrumbs`, `IBreadcrumbItem`, routing via `renderLink`, dropdowns, layout, keyboard, micro-apps       |
| [a11y-decision-matrix.md](a11y-decision-matrix.md)                       | Accessibility decision matrix: SegmentedControl vs Tabs vs Action Buttons vs Nav                                                             |
| [button-ui-guide.md](button-ui-guide.md)                                 | Comprehensive button UI guide: BaseButton, tokens, tooltips, toggles, segmented controls                                                     |
| [ui-consistency-guidelines.md](ui-consistency-guidelines.md)             | Empty states, buttons, loading indicators, status indicators and colours, tooltips, null-value display                                       |
| [tables.md](tables.md)                                                   | `useTable`, columns, filters, row actions, export                                                                                            |
| [forms.md](forms.md)                                                     | React Final Form, `*Group` / `*EditField` / `*Filter` patterns, `TabbedSection`                                                              |
| [filter-migration-guide.md](table/filter-migration-guide.md)             | Generated table filters from the OpenAPI schema                                                                                              |
| [migration-guide.md](table/migration-guide.md)                           | Migrating hand-rolled tables: choosing `Table`, `SimpleTable`, a form grid or a label/value block                                            |
| [theme.md](theme.md)                                                     | Dark mode and theming: semantic utilities, theme-aware tokens, third-party components                                                        |
| [design-tokens.md](design-tokens.md)                                     | Colour ramps, semantic roles (text scale, surfaces, borders, status matrix, brand), the Tailwind bridge, Bootstrap colour collisions, guards |
| [menu-navigation.md](menu-navigation.md)                                 | Sidebar menu structure and state-based routing                                                                                               |
| [sidebar.md](sidebar.md)                                                 | Sidebar navigation architecture, design tokens, components, and recipes                                                                      |
| [tailwind-shadcn-migration-notes.md](tailwind-shadcn-migration-notes.md) | Bootstrap → Tailwind/shadcn migration: cascade layers, `!important` collisions, token extraction, lint rules, visual-parity tests            |
| [class-names-and-data-attributes.md](class-names-and-data-attributes.md) | Native state and ARIA first, then when to use a class, `data-slot`, a state attribute or `data-testid`; examples; removing a hook safely     |
| [e2e-locators.md](e2e-locators.md)                                       | How waldur-integration-testing finds HomePort elements: every role, test id and slot it relies on                                            |
| [menus.md](menus.md)                                                     | Menus, dropdowns and popovers: which component to use, recipes, rules, how the looks work, testing                                           |
| [modals.md](modals.md)                                                   | Modals: `openDialog`, `ModalDialog`, `ModalShell`, the parts, sizes and options, `data-slot` styling hooks, testing                          |

## API and data

| Guide                                                      | Covers                                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [api-integration.md](api-integration.md)                   | React Query patterns, CRUD, data refresh, error handling                     |
| [sdk.md](sdk.md)                                           | Regenerating the TypeScript SDK (`waldur-js-client`) from the backend schema |
| [useManagedMutation.md](useManagedMutation.md)             | Mutation hook for modals: notifications, refetch, dialog closing             |
| [storage-manager.md](storage-manager.md)                   | `StorageManager` abstraction over localStorage                               |
| [permissions.md](permissions.md)                           | RBAC checks with `hasPermission()`                                           |
| [configuration-management.md](configuration-management.md) | Settings UI, `SettingsDescription` / `FeaturesEnums` generation              |
| [invitations.md](invitations.md)                           | Invitation flow architecture                                                 |

## Deployment and infra

| Guide                          | Covers                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| [micro-apps.md](micro-apps.md) | `apps/*` build/serve pipeline, `ASSET_PATH`, `waldur.deploy`, adding a new micro-app |

## Localization and terminology

| Guide                                          | Covers                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| [i18n.md](i18n.md)                             | Translation extraction, tooling, workflow, LLM-assisted analysis |
| [terminology_policy.md](terminology_policy.md) | UI terminology and spelling conventions                          |

## Scripts in this directory

| Script                                                 | Purpose                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| [update-local-sdk.sh](update-local-sdk.sh)             | Regenerate and link the local TypeScript SDK (see [sdk.md](sdk.md)) |
| [generate-sdk-catalog.py](generate-sdk-catalog.py)     | Generate a catalog of SDK functions from the OpenAPI schema         |
| [generate-sdk-claude-md.py](generate-sdk-claude-md.py) | Generate SDK usage notes for LLM context                            |
