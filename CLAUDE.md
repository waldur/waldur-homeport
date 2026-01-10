# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Waldur HomePort is a React-based web frontend for the Waldur MasterMind cloud orchestrator. It's a TypeScript application built with Vite that provides a comprehensive management interface for cloud resources, organizations, projects, and marketplace offerings.

## Core Philosophy

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

## Specialized Guides

This project uses specialized documentation and subagents for different aspects of development:

### 📖 Documentation Guides

- **[Development Workflow](docs/development-workflow.md)** - Planning, TDD process, and problem-solving strategies
- **[Code Quality](docs/code-quality.md)** - Testing, linting, TypeScript standards, and quality tools
- **[Architecture](docs/architecture.md)** - Redux/Saga patterns, component architecture, and system design
- **[Component Library](docs/component-library.md)** - UI components, BaseDeployPage pattern, and reusable widgets
- **[API Integration](docs/api-integration.md)** - React Query, Waldur JS Client, and data loading patterns
- **[Form Migration](docs/form-migration.md)** - Form patterns, Redux→React Final Form migration, and 200+ form components
- **[Development Setup](docs/development-setup.md)** - Build configuration, environment setup, and tooling

### 🤖 Specialized Subagents

The following subagents provide deep expertise in specific areas:

#### Frontend Specialists

- **developer-workflow** - Planning complex implementations and TDD workflow
- **code-quality** - Testing strategy, linting, and quality standards
- **architecture** - Modern state management patterns and component architecture decisions
- **component-library** - UI component development and BaseDeployPage customization
- **api-integration** - React Query, caching, and CRUD operation patterns
- **form-migration** - Form patterns and Redux→React Final Form migrations
- **development-setup** - Build issues, dependencies, and environment configuration
- **docs-writer** - Technical documentation creation (use only when explicitly requested)

## Quick Start

### Essential Commands

- `yarn start` - Development server (port 8001)
- `yarn build` - Production build
- `yarn test` - Run unit tests
- `yarn lint:check` - Code quality checks
- `yarn lint:fix` - Auto-fix linting issues where possible

### Translation Management

- `yarn i18n:analyze <lang>` - Analyze translation quality for specific language (e.g., `yarn i18n:analyze et`)
- `yarn i18n:check` - Check translation completeness and consistency
- `yarn i18n:validate` - Validate translation file syntax
- `yarn gettext:extract` - Extract translatable strings from source code

**Supported Languages for Analysis**: 27 languages with specialized analyzers including Estonian (et), Russian (ru), Norwegian (nb), German (de), Spanish (es), French (fr), Italian (it), Polish (pl), Czech (cs), Lithuanian (lt), Latvian (lv), Bulgarian (bg), Slovenian (sl), Greek (el), Dutch (nl), and many others. Use `yarn i18n:analyze --help` to see all available languages.

### Dependency Management

- **Checking waldur-js-client versions**: Use `npm view waldur-js-client versions --json | tail -20` to see all recent versions including dev releases (not just `npm view waldur-js-client version` which only shows latest stable)
- **Upgrading waldur-js-client**: Update version in package.json, then run `yarn install`

### Browser Debugging with MCP Chrome DevTools

When debugging the frontend application using MCP Chrome DevTools:

1. **Default Staff Credentials**: Username `staff`, password `demo`

2. **Authentication Setup**: Set the authentication token in localStorage using the correct key:

   ```javascript
   localStorage.setItem('waldur/auth/token', 'your-token-here');
   ```

3. **Testing Removed Projects**: When testing removed project functionality, use URLs with `include_terminated=true`:

   ```text
   http://localhost:8001/projects/{uuid}/?include_terminated=true
   http://localhost:8001/projects/{uuid}/manage/?include_terminated=true&tab=general
   ```

4. **Common MCP Commands**:
  - `mcp__chrome-devtools__take_snapshot` - Get page structure
  - `mcp__chrome-devtools__evaluate_script` - Run JavaScript in browser
  - `mcp__chrome-devtools__list_console_messages` - Check for errors
  - `mcp__chrome-devtools__navigate_page` - Navigate to specific URLs

5. **Debugging Tips**:
  - Always set the auth token before navigating to protected pages
  - Use console.log statements in components for debugging state
  - Check network requests to verify API calls are working correctly
  - Use take_snapshot to verify UI changes are applied

### Key Reminders

**NEVER**:

- Use `--no-verify` to bypass commit hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile

**ALWAYS**:

- Commit working code incrementally
- Learn from existing implementations
- Use specialized guides and subagents for deep expertise
- **Memoize filter objects in useTable hooks** - When passing filter objects containing selector values to `useTable`, wrap them in `useMemo` to prevent infinite re-renders (e.g., `const filter = useMemo(() => ({ customer_uuid: customer.uuid }), [customer.uuid])`)
- **Use design token button variants** - Use variants like `tertiary`, `danger`, `success`, `text-primary`, etc. instead of deprecated variants like `btn-outline-default`, `light-danger`, etc. The linter will catch and suggest fixes for deprecated button styles.

## Getting Help

For specific development tasks, use the appropriate specialized guide or subagent. This structure ensures you get focused, expert guidance for each aspect of the Waldur HomePort development process.
