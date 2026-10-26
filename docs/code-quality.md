# Code Quality Standards

This guide covers code quality standards, testing practices, and technical requirements for Waldur HomePort.

## Technical Standards

### Architecture Principles

- **Composition over inheritance** - Use dependency injection
- **Interfaces over singletons** - Enable testing and flexibility
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

### Code Quality Requirements

- **Every commit must**:
  - Compile successfully
  - Pass all existing tests
  - Include tests for new functionality
  - Follow project formatting/linting

- **Before committing**:
  - Run formatters/linters
  - Self-review changes
  - Ensure commit message explains "why"

### Error Handling

- Fail fast with descriptive messages
- Include context for debugging
- Handle errors at appropriate level
- Never silently swallow exceptions

## Development Guidelines

### TypeScript Configuration

- Uses `@/*` path mapping for internal imports
- Strict TypeScript checking disabled for legacy compatibility
- Module resolution set to "Bundler" for Vite compatibility

### Code Style

- ESLint with flat config format enforced with TypeScript, React, and accessibility rules
- Prettier for code formatting (2 spaces, semicolons, single quotes)
- Import ordering enforced with `@waldur` imports grouped separately
- SCSS/CSS linting with Stylelint
- Husky for git hooks and pre-commit checks

#### Check Code Style Tool Versions

```bash
Check current versions

yarn info eslint prettier stylelint husky version
```

### TypeScript and SDK Types

- **Always prefer SDK types over custom types** from `waldur-js-client` package
- Import types using `type` keyword: `import { type ComponentUsageCreateRequest } from 'waldur-js-client'`
- Common SDK types to use instead of custom interfaces:
  - `ResourcePlanPeriod` - for plan periods with components
  - `BaseComponentUsage` - for component usage data in periods
  - `ComponentUsageCreateRequest` - for usage submission request bodies
  - `ComponentUserUsageCreateRequest` - for user usage submission request bodies
  - `ComponentUsage` - for general component usage data
  - All marketplace API request/response types are available in the SDK
- When using React Final Form, use standard pattern: `<Field component={NumberField} />`
- Convert between SDK string types and numbers when necessary (e.g., `parseFloat(component.usage)`)
- Handle nullable SDK types properly with optional chaining (`period.value?.components`)

## Tooling

### Essential Commands

#### Code Quality

- `yarn lint:check` - Run ESLint checks
- `yarn lint:fix` - Fix ESLint issues automatically
- `yarn format:check` - Check code formatting with Prettier
- `yarn format:fix` - Auto-format code with Prettier
- `yarn style:check` - Check SCSS/CSS styles with Stylelint
- `yarn deps:unused` - Check for unused dependencies with Knip
- `yarn tsgo` - Typescript type check

#### Dependency Management

- `yarn deps:unused` - Find unused dependencies and exports with Knip
- `yarn deps:circular` - Check for import cycles with oxlint `import/no-cycle` (config: `.oxlintrc.cycles.json`; `@/` imports are resolved). Every static import counts, including `import type` / `export type` and a plain import of a type; only a dynamic `import()` does not, since lazy pages and dialogs are split off that way. oxlint reports each import that closes a cycle rather than the whole chain: follow the reported import lines from file to file to see it.

### Tooling Standards

- Use project's existing build system
- Use project's test framework
- Use project's formatter/linter settings
- Don't introduce new tools without strong justification

## Quality Assurance

### Code Quality & Analysis

- **Knip** for unused dependency detection
- **oxlint `import/no-cycle`** for circular dependency analysis
- **Lint-staged** for pre-commit code formatting
- **CSS**: SCSS compiled by Sass, Tailwind CSS v4 through `@tailwindcss/vite` (which adds vendor prefixes itself), and Vite's minification in production builds. There is no PostCSS configuration.

### Modern Development Practices

- **ESM (ES Modules)** throughout the codebase
- **TypeScript** with comprehensive typing
- **Flat ESLint config** format
- **Husky** git hooks for automated quality checks
- **Yarn** package management with lockfile integrity

## UI-Router state name guard

`src/state-names.test.ts` is a Vitest smoke test that asserts every literal UI-Router state name referenced from source (`<Link state="...">`, `<UISref state="...">`, `router.stateService.go('...')`, and breadcrumb `to:` fields) resolves to a state registered in `src/states.ts`. It catches the regression class where a route is renamed in a `routes.ts` module but call sites elsewhere keep the old name and silently 404.

Dynamic references (`state={variable}`, `router.stateService.go(name)`, computed names) are skipped — the literal-string regexes do not match expression syntax.

### Opt-outs

- **Per-line**: append `// state-check: ignore` to the line containing the literal. Use this for fixture data or constants where the literal value is intentionally not a real state name.
- **Global allowlist** (in the test file): for values that are intentionally not in the registry but legitimately appear in the codebase (e.g., the `'404'` fallback used inside `useSref(state || '404', ...)` in `src/core/Link.tsx`). Keep this set small and add a comment explaining each entry.
- **Known-broken set** (in the test file): for pre-existing broken references that require product knowledge to fix. Do not add new entries — fix the reference instead. When the last call site for an entry is gone, remove the entry.

## Unknown class guard

Tailwind and Bootstrap both ignore a class they do not know, so a typo (`felx`, `text-teritary`, `md:hiden`) or a class whose stylesheet was retired renders as nothing, with no warning from the build, the type checker or the browser. `waldur-custom/no-unknown-class` reports every class that styles nothing.

A class is known when either:

- **Tailwind generates CSS for it.** The rule asks the same Tailwind design system the build loads from `src/tailwind.css`, so variants, arbitrary values, `!`, opacity modifiers, `@theme` tokens and `@utility` definitions are judged exactly as the build judges them. There is no hand-kept list of utilities.
- **A stylesheet defines it.** Every `.scss` (compiled with Sass) and `.css` file under `src/`, `packages/` and `apps/`, plus the `node_modules` stylesheets the source imports, contributes its class selectors. A class counts as defined if it appears in any selector, including one that only applies inside a parent (`.card .small`).
- **An arbitrary variant styles it.** A class selected inside a Tailwind arbitrary variant in any source file (`[&_.x]:`, `has-[.x]:`, `group-[.x]:`) counts as defined, since that variant styles it. These are read from the source on every recheck, not cached; the lint plugin's own files are skipped.

The rule reads class positions only:

- `className` and any `*ClassName` attribute or property;
- the arguments of `cn`/`clsx`/`classNames`/`cx`/`twMerge`;
- `cva` bases and variant values;
- variables named `*class`, `*classes` or `*className`, in any case (`activeClass`, `BASE_CLASSNAME`).

A `const` used in one of those positions is followed to its value in the same file: `className={BASE}` checks `BASE`, `cn(SIZES[size])` checks every value of `SIZES`, `TONE.danger` checks that entry. Imports, parameters and `let` are not followed. A token glued to a `${…}` in a template literal is a fragment and is skipped. The message names the nearest real class when there is one (`Did you mean "flex"?`).

Implementation: `packages/eslint-plugin-waldur/lib/class-oracle.js`, reached from the synchronous rule through a `synckit` worker. The rule finds the repository root from its own location, so ESLint can run from any directory. Compiled stylesheet classes are cached in `node_modules/.cache/eslint-plugin-waldur/`, keyed by every stylesheet's path, size and mtime and by `yarn.lock`; a long-lived ESLint server (the editor's) picks up stylesheet changes within a few seconds.

### Existing violations

Existing violations are listed per file in `unknown-classes.baseline.json`. A listed class is not reported in its file; any other unknown class is, whatever else the change does. A listed class the file no longer has (fixed, removed, or now defined by a stylesheet) is reported as stale, so the list only shrinks.

- After fixing listed classes, rewrite the list: `yarn lint:classes:baseline`.
- Never add entries for new code. Fix the class instead.

### Classes that deliberately style nothing

A class used only as a hook (for a test or a third-party script) should be a `data-*` attribute instead (`data-slot`, `data-testid`); [class-names-and-data-attributes.md](class-names-and-data-attributes.md) says which one. Where it cannot be, list a pattern in the rule's `allow` option in `eslint.config.js`, so each exception is a visible decision. `UNKNOWN_CLASS_HOOKS` there lists the classes the end-to-end suite in `waldur-integration-testing` selects on, now only react-select's `metronic-select__*`; remove one only together with its selector there. Test files (`*.test.ts(x)`) are exempt because they pass made-up classes to check that a prop is forwarded.
