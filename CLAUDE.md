# CLAUDE.md

Waldur HomePort is a React/TypeScript/Vite frontend for the Waldur MasterMind cloud orchestrator.

## Core Philosophy

- **Incremental progress** - Small changes that compile and pass tests
- **Learn from existing code** - Study patterns before implementing
- **Clear intent over clever code** - Be boring and obvious

## Essential Commands

```bash
yarn start          # Dev server (port 8001)
yarn build          # Production build
yarn test           # Unit tests
yarn lint:check     # Code quality
yarn lint:fix       # Auto-fix linting
```

## Project Structure

- `src/` - Application source code
- `docs/` - Detailed guides (see below)
- `.claude/agents/` - Specialized subagents for complex tasks

## Guides & Subagents

For detailed guidance, see `docs/`:

- `development-workflow.md` - Planning, TDD, problem-solving
- `code-quality.md` - Testing, linting, TypeScript
- `architecture.md` - Redux/Saga, component patterns
- `component-library.md` - UI components, BaseDeployPage
- `api-integration.md` - React Query, CRUD patterns
- `form-migration.md` - Redux → React Final Form
- `development-setup.md` - Build, environment, tooling

Subagents in `.claude/agents/` provide deep expertise for each area.

## Critical Rules

**NEVER:**

- Use `--no-verify` to bypass hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile

**ALWAYS:**

- Memoize filter objects in `useTable` hooks to prevent infinite re-renders:

  ```typescript
  const filter = useMemo(() => ({ customer_uuid: customer.uuid }), [customer.uuid]);
  ```

- Use design token button variants (`tertiary`, `danger`, `success`, `text-primary`) - linter enforces this

## Sentry Issue Workflow

When given a Sentry URL:

1. **Fetch** - Use `mcp__sentry__get_issue_details` with the URL
2. **Analyze** - Identify root cause from stack trace and browser/environment info
3. **Fix** - Implement the fix
4. **Branch** - Create branch: `fix/sentry-{ISSUE-ID}` (e.g., `fix/sentry-PUHURI-PORTALS-E5C`)
5. **Commit** - Use `[{ISSUE-ID}]` prefix and include `Fixes {ISSUE-ID}` in message body
6. **Push** - Push with `-u origin` to set upstream

## Task-Specific Docs

These are NOT always-loaded - reference when needed:

- Translation: `yarn i18n:analyze --help` for commands
- MCP Debugging: See `docs/development-setup.md`
- Dependencies: `npm view waldur-js-client versions --json | tail -20`
