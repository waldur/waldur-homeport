# Architecture Agent

Use this agent when working with modern state management patterns, component architecture decisions, and understanding the overall application structure.

## Specialization

This agent specializes in:
- **Modern State Management**: React Query, React Final Form, local component state
- **Legacy System Understanding**: Redux (for maintenance only - deprecated for new development)
- **Component Architecture**: Container vs Presentation component patterns
- **State Management Migration**: Moving from Redux to React Query patterns
- **Navigation & Routing**: UI-Router React state-based routing
- **Module Organization**: Feature-based folder structure and domain separation
- **Modern Data Fetching**: React Query, custom hooks, caching strategies

## When to Use

Use this agent when:
- **New Development**: Implementing React Query, custom hooks, local state patterns
- **Legacy Maintenance**: Understanding existing Redux code (do not extend)
- **Architecture Decisions**: Choosing between React Query vs local state
- **Component Design**: Container vs presentation component patterns
- **State Migration**: Moving from Redux to modern patterns
- **Navigation**: Setting up UI-Router React routing patterns
- **Module Organization**: Structuring feature-based folders
- **Data Flow**: Understanding modern async operation patterns

## Key Architectural Patterns

### Modern State Management (Use for New Development)
- **TanStack React Query**: Server state, caching, and data fetching
- **React Final Form**: Local form state management
- **Local Component State**: useState, useReducer for UI state
- **Custom Hooks**: Reusable state logic and business operations

### Legacy State Management (Maintenance Only - Do Not Extend)
- **Redux Store**: Global application state (legacy - avoid for new features)
- **Table Store**: Specialized table data management (`src/table/` - legacy pattern)

### Component Architecture
- **Container Components**: Data fetching and state management
- **Presentation Components**: Pure UI components with props
- **Form Components**: React Final Form integration
- **Table Components**: Reusable table infrastructure

### Module Organization
Feature-based structure under `src/`:
- Domain-specific folders (customer, project, marketplace, etc.)
- Co-located components with business logic
- Shared utilities in `core/` and `table/`
- API interactions through Redux patterns

### Navigation & Routing
- **UI-Router React**: State-based routing system
- **Route Definition**: Module-specific `routes.ts` files
- **Navigation Context**: Tab and breadcrumb management

## Technology Stack

- **React 18.3.0** with TypeScript 5.7.3
- **Redux 4.2.1** for legacy state management
- **UI Router React 1.0.7** for navigation
- **React Bootstrap 2.10.9** for UI components
- **TanStack React Query 5.80.6** for server state
- **Vite 7.0** for build tooling

## Data Fetching Patterns

### Modern Approach (Use for New Development)
**React Query** is the preferred pattern:
- Server state management and caching
- Automatic background refetching
- Query invalidation and optimistic updates
- Custom hooks for reusable data fetching logic
- Built-in loading, error, and success states

```typescript
// Modern pattern - USE THIS
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchResource(id),
  staleTime: 5 * 60 * 1000,
});
```

## Performance Optimizations

### Modern Optimizations
- **React Query Caching**: Intelligent server state caching with 5-minute stale time
- **Component Lazy Loading**: `lazyComponent` utility for code splitting
- **Route-based Splitting**: Automatic code splitting by feature
- **Custom Hooks**: Reusable logic with proper memoization
- **Asset Optimization**: Images, fonts, SVG processing through Vite

### Legacy Optimizations (Avoid for New Features)
- **Dynamic Reducers**: Runtime Redux reducer injection (legacy pattern)
- **Redux Memoization**: Reselect and selector patterns (use React Query instead)

## Migration Guidelines

### ✅ DO for New Components
- Use React Query for server state
- Use local component state (useState, useReducer)
- Use custom hooks for reusable logic
- Use React Final Form for forms

### ❌ DON'T for New Components
- Don't add new Redux actions/reducers
- Don't extend existing Redux patterns
- Don't create new table store implementations

### 🔧 Legacy Maintenance
- Understand Redux for bug fixes only
- Gradually migrate components to modern patterns
- Don't break existing Redux functionality