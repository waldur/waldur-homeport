# Menu and Navigation Architecture Guide

This guide describes the navigation and menu architecture in Waldur Homeport, covering routing, dynamic sidebar generation, and workspace management.

## Architecture Overview

Waldur Homeport uses a state-based navigation system driven by **UI-Router for React**. The UI structure is organized into **Workspaces** (e.g., Project, Organization, Administration, Support).

### Core Components

- **Router**: `src/router.ts` initializes the UI-Router.
- **States**: `src/states.ts` aggregates all module-specific `routes.ts`.
- **Layout**: `src/navigation/Layout.tsx` defines the main container.
- **Sidebar**: `src/navigation/sidebar/UnifiedSidebar.tsx` manages all sidebar content.
- **Tabs**: `src/navigation/TabsList.tsx` manages the header/tab-bar navigation.

## State-based Routing

Routes are defined as "states" in module-specific files. Each state can have metadata in the `data` property:

```typescript
{
  name: 'admin-reporting-settings',
  parent: 'admin-configuration',
  url: 'reporting-settings/',
  component: ...,
  data: {
    breadcrumb: () => translate('Reporting settings'),
    feature: 'reporting', // Optional feature toggle
    permissions: [isStaff], // Optional permission guards
    priority: 100, // Used for sorting in menus
  }
}
```

## Dynamic Navigation (useTabs)

The application uses a dynamic approach to build menus. Instead of hardcoding every link, the `useTabs.tsx` hook inspects the registered router states to build a hierarchy.

### How it works

1. **Root Detection**: Finds the "root" state for the current path (e.g., the state with a `title`).
2. **Filtering**: Collects states that are children of the root and meet visibility criteria (feature flags, permissions).
3. **Hierarchy**: Groups states into parent-child relationships based on state naming (e.g., `parent.child`) or the `parent` property.
4. **Active State**: Tracks the current state to highlight items in the sidebar or tabs.

## Sidebar Organization

The `UnifiedSidebar.tsx` component conditionally renders menu items based on the active workspace and user roles:

- **OrganizationsListMenu**: List of organizations the user can access.
- **ProjectsListMenu**: List of projects within the active organization.
- **ResourcesMenu**: High-level resource categories.
- **AdminMenu**: System management links (Staff/Support only).
- **Public/Anonymous Menus**: Links visible to unauthenticated users.

### Key Sidebar Components

- **MenuItem**: A single clickable link with icon and badge.
- **MenuAccordion**: A collapsible group for nested items.

## Workspaces

A "Workspace" is a logical context (like a specific Project or the entire Administration area).

- Workspaces are defined in route metadata (`workspace: 'admin'`).
- The `src/workspace/` module provides selectors to get the current customer, project, or user roles.
- The UI often resets or switches functionality based on the active workspace.

## How-to: Adding a New Menu Item

### Method A: Route-driven (Recommended for Configuration/Details)

1. Add a new route in `routes.ts`.
2. Ensure it has a correctly named `parent`.
3. Provide a `breadcrumb` function and `priority` in `data`.
4. `useTabs` will automatically pick it up and display it in the appropriate sub-menu.

### Method B: Explicit Component (For Top-level/Global links)

1. Create a new menu component in `src/navigation/sidebar/`.
2. Use the `MenuItem` component.
3. Import and add it to `UnifiedSidebar.tsx`.

---

## LLM Quick-start Patterns

When asking an LLM to modify navigation:

1. **Identify parents**: "Add a child route to `admin-configuration`."
2. **Specify breadcrumbs**: "The breadcrumb should be 'Invoices'."
3. **Reference workspace**: "The user is currently in the 'Organization' workspace."
4. **Check visibility**: "This item should only be visible if `isStaff` is true."
