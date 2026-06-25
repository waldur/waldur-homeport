# Developer Documentation Index

Guides for working on Waldur HomePort. Start with [development-setup.md](development-setup.md) if you are new to the codebase. The root `CLAUDE.md` file curates the most critical rules for day-to-day work.

## Getting started

| Guide                                              | Covers                                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [development-setup.md](development-setup.md)       | Environment setup, essential commands, build tooling, browser debugging, i18n commands |
| [development-workflow.md](development-workflow.md) | Planning, TDD, problem-solving approach                                                |
| [architecture.md](architecture.md)                 | Redux store, UI-Router routing, component organization                                 |
| [code-quality.md](code-quality.md)                 | Linting, formatting, TypeScript checks                                                 |
| [testing.md](testing.md)                           | Vitest unit testing and E2E standards                                                  |

## UI patterns

| Guide                                                        | Covers                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| [component-library.md](component-library.md)                 | Reusable UI components: buttons, modals, tables, filters — with prop references |
| [ui-consistency-guidelines.md](ui-consistency-guidelines.md) | Empty states, buttons, loading indicators, tooltips, null-value display         |
| [tables.md](tables.md)                                       | `useTable`, columns, filters, row actions, export                               |
| [forms.md](forms.md)                                         | React Final Form, `*Group` / `*EditField` / `*Filter` patterns, `TabbedSection` |
| [filter-migration-guide.md](table/filter-migration-guide.md)       | Generated table filters from the OpenAPI schema                                 |
| [button-variant-linting.md](button-variant-linting.md)       | Design-token button variants and the ESLint rule enforcing them                 |
| [theme.md](theme.md)                                         | Dark mode and theming, including third-party components                         |
| [menu-navigation.md](menu-navigation.md)                     | Sidebar menu structure and state-based routing                                  |

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
