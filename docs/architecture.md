# Architecture Guide

This guide covers the application architecture, design patterns, and organizational structure of Waldur HomePort.

## Frontend Stack

- **React** with TypeScript for component development
- **Vite** for build tooling and development server
- **Redux** with Redux Saga for legacy state management
- **UI Router React** for navigation (state-based routing)
- **React Bootstrap** (Bootstrap 5) for UI components
- **React Final Form** for modern form handling
- **ECharts** for data visualization
- **Leaflet** with React Leaflet for mapping
- **TanStack React Query** for server state management

### Check Current Versions

Check all major dependencies

`yarn list react typescript vite redux @uirouter/react react-bootstrap react-final-form echarts leaflet @tanstack/react-query`

Check specific package version

yarn info <package-name> version

## Key Architectural Patterns

### Module Organization

The codebase follows a feature-based folder structure under `src/`:

- Each domain (customer, project, marketplace, etc.) has its own folder
- Components are co-located with their specific business logic
- Shared utilities are in `core/` and `table/`
- API interactions use Redux patterns with sagas

### State Management

#### Modern Patterns (Use for New Development)

- **TanStack React Query**: Server state management and caching for API calls
- **React Final Form**: Local form state management
- **Local Component State**: useState and useReducer for UI state
- **Custom Hooks**: Reusable state logic and business operations

#### Legacy Patterns (Maintenance Only - Do Not Extend)

- **Redux Store**: Global state with dynamic reducer injection (legacy - avoid for new features)
- **Redux Saga**: Async operations and side effects (legacy - use React Query instead)
- **Table Store**: Specialized table data management in `src/table/` (legacy pattern)

### Navigation & Routing

- Uses UI-Router for React with state-based routing
- Routes defined in module-specific `routes.ts` files
- Navigation context provides tab and breadcrumb management

### Data Fetching

#### Modern Approach (Use for New Development)

- **TanStack React Query**: Preferred for server state management and caching
- **Custom Hooks**: Reusable data fetching logic with React Query
- **Waldur JS Client**: TypeScript API client integration
- **Automatic Caching**: 5-minute stale time with background refetching

#### Legacy Approach (Maintenance Only)

- **Redux Actions/Sagas**: Centralized API calls (legacy - use React Query instead)
- **Table Store**: Standardized data loading patterns (legacy pattern)
- **Periodic Polling**: Real-time updates through sagas (use React Query polling instead)

## Component Architecture

- **Container Components**: Handle data fetching and state management
- **Presentation Components**: Pure UI components with props
- **Form Components**: Specialized forms using React Final Form
- **Table Components**: Reusable table infrastructure with filtering, sorting, pagination

## Key Directories

- `src/core/` - Shared utilities, API clients, and base components
- `src/table/` - Reusable table components and data management
- `src/form/` - Form components and field implementations
- `src/marketplace/` - Service marketplace and offering management (largest module)
- `src/customer/` - Organization management and billing
- `src/project/` - Project management and resources
- `src/auth/` - Authentication and identity provider integration
- `src/administration/` - Admin panel functionality
- `src/azure/` - Azure cloud integration
- `src/booking/` - Resource booking system
- `src/broadcasts/` - System announcements
- `src/dashboard/` - Dashboard components
- `src/navigation/` - Navigation and layout components
- `src/proposals/` - Proposal management
- `src/quotas/` - Resource quotas management
- `src/theme/` - Theme management (dark/light mode)
- `src/user/` - User management
- `src/metronic/` - UI framework integration

## Backend Integration

Integrates with Waldur MasterMind REST API requiring CORS configuration on the backend for local development.

### API Client

- **Waldur JS Client** - Custom API client for Waldur MasterMind
- Auto-generated client with TypeScript support
- Request/response interceptors for authentication and error handling
- Token-based authentication with auto-refresh capabilities

#### Version Management

Check current version

`grep "waldur-js-client" package.json`

Check latest available version

`yarn info waldur-js-client version`

Update to latest version in package.json, then install

`yarn install`

## Build System & Performance

### Modern Build Configuration

- **Vite 7.0** with ES modules support
- **Node.js v23.7.0** (latest LTS) compatibility
- Code splitting with lazy loading for all major features
- Optimized bundle sizes and asset processing
- Source maps for development and production debugging

### Performance Optimizations

- Lazy component loading with `lazyComponent` utility
- Dynamic reducer injection for Redux store
- Automatic code splitting by route and feature
- Optimized asset loading (images, fonts, SVG)
- Bundle analysis and optimization tools

## Asset Management

- SVG files processed through SVGR 8.1.0 plugin for React components
- Images and static assets in `src/images/`
- Font files managed through Vite's asset pipeline
- Markdown content processed through vite-plugin-markdown
- Monaco Editor 0.52.2 for code editing capabilities
- Sass 1.85.0 for SCSS preprocessing

## Environment Variables

- `VITE_API_URL` - Backend API endpoint (defaults to <http://localhost:8000>/)

## Project Overview

Waldur HomePort is a React-based web frontend for the Waldur MasterMind cloud orchestrator. It's a TypeScript application built with Vite that provides a comprehensive management interface for cloud resources, organizations, projects, and marketplace offerings.
