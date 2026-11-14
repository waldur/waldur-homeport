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
yarn test:storybook # Storybook tests
yarn tsgo --noEmit  # TypeScript checks
yarn lint:check     # Code quality
yarn lint:fix       # Auto-fix linting
```

## Project Structure

- `src/` - Application source code
- `packages/` - Workspace packages (`packages/ui`, `packages/design-tokens`)
- `docs/` - Detailed guides (see below)
- `.claude/agents/` - Specialized subagents for complex tasks

## Guides & Subagents

For detailed guidance, see `docs/` — full index with one-line descriptions in `docs/README.md`. Most-used guides:

- `development-workflow.md` - Planning, TDD, problem-solving
- `code-quality.md` - Linting, formatting, TypeScript
- `testing.md` - Frameworks, strategy, unit & E2E standards
- `visual-testing.md` - Visual regression: Storybook comparison against `develop`, parity/geometry specs, integration-testing screenshots, what to report
- `architecture.md` - Redux, component patterns
- `component-library.md` - UI components, BaseDeployPage
- `api-integration.md` - React Query, CRUD patterns
- `forms.md` - React Final Form and VStepperForm patterns
- `property-fields.md` - Read-only rows: typed property formatters (`propVal.date`, `propVal.currency`, …), `prefer-typed-property`
- `tabs.md` - Tabs: `Tabs`, `TabNav`, `EmbeddedTabs`, mount modes, and the `nav-*` classes they replaced
- `menus.md` - Menus, dropdowns and popovers: `Menu`, `MenuPopover`, `ActionsMenu`, row actions
- `modals.md` - Modals: `openDialog`, `ModalDialog`, `ModalShell`, waldur-ui Modal parts, `data-slot` styling hooks
- `breadcrumbs.md` - Breadcrumbs: `useBreadcrumbs`, `IBreadcrumbItem`, `BreadcrumbTrail`, `renderLink`, dropdown crumbs
- `tables.md` - Modular index for useTable, columns, filters, row actions, export, and visual customizations
- `table/filter-migration-guide.md` - Generated table filters from OpenAPI schema
- `table/styling-architecture.md` - How the table is drawn: `--table-*` custom properties, one row background class, `data-state`/`data-slot` hooks, and the checks to run before changing them
- `development-setup.md` - Build, environment, tooling
- `design-tokens.md` - Colour ramps generated from `tokens/colors.json` (never edit `colorRamps.css`)
- `ui-consistency-guidelines.md` - Empty states, buttons, loading, tooltips
- `class-names-and-data-attributes.md` - Perceivable state is native/ARIA (styled via `disabled:`/`aria-*:`); classes only style; `data-slot`/`data-state`/`data-testid` mark the rest, never a marker class

Subagents in `.claude/agents/` provide deep expertise for each area.

## Critical Rules

**NEVER:**

- Use `--no-verify` to bypass hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile

**ALWAYS:**

- Memoize filter objects in `useTable` hooks to prevent infinite re-renders:

  ```typescript
  const filter = useMemo(
    () => ({ customer_uuid: customer.uuid }),
    [customer.uuid],
  );
  ```

- **Never hand-roll a table** with raw `<table>`/`<thead>`/`<tbody>`. It
  silently loses the header styling, sort
  carets, column sizing, hover/selection, loading skeletons and the shared
  `NoResult` empty state, so it looks visibly foreign next to every other list
  in the app. Pick the replacement by what the table is, using the decision tree
  in `docs/table/migration-guide.md`:
  - **A list of records** read from a paginated endpoint, or that needs
    search, sorting, filters, selection, expandable rows, a menu of row
    actions, an empty-state CTA or export → `@/table/Table` with `useTable`,
    including small ones nested inside an expandable row, a tab or a modal.
  - **A read-only list already in memory** (dialog summary, preview,
    reference list, review step) → `SimpleTable` (`@/table/SimpleTable`),
    which takes the same `Column<T>` definitions. Row count alone is not a
    reason for `Table`: cap a long one's height with a scroll container.
  - **Label/value pairs about one object** → not a table, and never a raw `<dl>`
    grid or a local `DetailRow`. Use `PropertyList`, `PropertyItem`, and
    `PropertyCard` from `waldur-ui` (`packages/ui/src/PropertyList`, which
    renders `<dl>/<dt>/<dd>` with CSS subgrid and `FieldScope`). Wrap in
    `<PropertyList>` (`variant="divided"` by default, with `<PropertyItem>` /
    `*EditField`) when a row can be edited or acted on, or every property
    must show even when empty — a divided row shows a dash for an empty
    value by itself, so pass raw values. Use `<PropertyList
variant="summary">` (or `ExpandableContainer asTable`, which renders
    one) for a read-only summary that leaves out empty rows (pass raw
    values; `0` shows, and `renderFieldOrDash` keeps an empty row). Rows
    always sit in a list: a `PropertyItem` on its own is a one-row `<dl>`
    (linter: `property-item-in-list`; a component that returns only rows is
    fine, its caller holds the list), and a `PropertyList` must not hold only
    a single lone property item (linter: `no-lone-property-item-in-list`). See
    the guide's "Label/value block".
  - **A grid of form inputs, custom layout, or preview** → waldur-ui's `Table`
    primitives (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`,
    `TableCell`, `TableFooter`), which use `--table-*` tokens and provide
    `density="compact"`, `scrollable={false}`, and `hoverable={false}` controls.

  For `@/table/Table` with data you already hold in memory (or that comes from
  one aggregate endpoint), `fetchData` may resolve rows directly instead of
  using `createFetcher`. The table pages only what `fetchData` returns: resolving
  every row with the pager on shows pages that all list the same rows. So
  either page them with `createClientPaginatedFetcher` (see
  `docs/table/fetching.md`), or, for a short bounded list, turn the pager off:

  ```typescript
  import { createClientPaginatedFetcher } from '@/table/api';

  const tableProps = useTable({
    table: `my-nested-table-${scopeUuid}`,
    fetchData: createClientPaginatedFetcher(rows),
  });
  // Rows from a separate useQuery: the fetcher closes over them, so fetch
  // again when they arrive, or the table keeps its first, empty, result.
  useEffect(() => {
    tableProps.fetch();
  }, [data]);
  // Nested/embedded tables: drop the chrome the parent already provides.
  <Table {...tableProps} columns={columns} verboseName={translate('items')}
         hideTitle hasActionBar={false} placeholderHasRetry={false} />

  // A short, bounded list: every row, no pager.
  <Table {...tableProps} hasPagination={false} … />
  ```

  The same holds for `createFetcher` on an endpoint that is not paginated
  (a detail action returning a plain list, with no `X-Result-Count`): its
  count is `NaN` and the pager shows over every row. Fetch the list once with
  `useQuery` and page it as above, or set `hasPagination={false}`.

  Reference: `src/customer/roles/RoleUsersExpandableRow.tsx`,
  `src/administration/celery/CeleryTaskTable.tsx` (in-memory rows).

- **Table imports** — there is no barrel `@/table` export. Always import from subpaths:

  ```typescript
  import Table from '@/table/Table';
  import { useTable } from '@/table/useTable';
  import { createFetcher } from '@/table/api';
  import { ActionsDropdown } from '@/table/ActionsDropdown';
  import { ActionButton } from '@/table/ActionButton';
  ```

  `createFetcher` takes an SDK function (not a string endpoint name):

  ```typescript
  // CORRECT
  fetchData: createFetcher(marketplaceResourceProjectsList);
  // WRONG — string endpoints are not supported
  fetchData: createFetcher('marketplace-resource-projects');
  ```

- **Row actions** must use the 3-dots dropdown pattern (`ActionsDropdown` + `ActionItem`), not standalone buttons:

  ```typescript
  // CORRECT — 3-dots dropdown with ActionItem children
  import { ActionsDropdown } from '@/table/ActionsDropdown';
  import { ActionItem } from '@/resource/actions/ActionItem';

  rowActions={({ row }) => (
    <ActionsDropdown row={row} refetch={tableProps.fetch}>
      <DeleteAction row={row} refetch={tableProps.fetch} />
    </ActionsDropdown>
  )}

  // Where DeleteAction uses ActionItem:
  const DeleteAction = ({ row, refetch }) => (
    <ActionItem
      title={translate('Delete')}
      action={handler}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  );

  // WRONG — bare ActionButton in rowActions
  rowActions={({ row }) => (
    <ActionButton title="Delete" action={handler} />
  )}
  ```

  Reference: `src/marketplace/resources/projects/ResourceUserInvitationsList.tsx`

- Use design token button variants (`tertiary`, `danger`, `success`, `text-primary`) - linter enforces this

- **Font weight is one scale**: `font-light` (300, display only), `font-normal`, `font-medium`, `font-semibold`, `font-bold` (700); SCSS reads `var(--font-weight-*)`. Never `fw-*` (retired — its `fw-bold` was 500, not 700), `font-black`/`font-[600]`, or an inline `fontWeight` (linter: `require-weight-scale`, which autofixes `fw-*`; see `docs/design-tokens.md` → "Font weight")

- **Spacing is one scale**: Tailwind's, `--spacing` pinned to 4px, so `mb-3` is 12px. Never arbitrary `[6.5px]` steps, or a class built at runtime (`` `mb-${space}` `` generates nothing; look it up in a map of literals like `SPACE_CLASSES`). See `docs/design-tokens.md` → "Spacing"

- **Colours come from semantic tokens** (see `docs/design-tokens.md`):
  - Write a token as its utility, not `text-[var(--text-tertiary)]` (linter: `prefer-token-utility`, autofix; it reads `tailwind/theme.css`, so tokens without a utility such as `--bg-brand-primary-alt` or the component `--input-*` keep the arbitrary form).
  - Neutral text/icons use the one scale `text-primary` … `text-senary` (= `var(--text-primary)` …); surfaces `bg-primary` … `bg-quaternary`; borders `border-primary` / `border-secondary` / `border-divider`. A semantic utility is always the token of the same name. Brand is `text-brand` / `border-brand` / `outline-brand`, fills `bg-brand-solid` / `bg-brand-subtle`, the pale brand edge `border-brand-subtle`; page and card surfaces `bg-page` / `bg-card`; dialog footer buttons `min-w-dialog-action`.
  - State colours use the status matrix through its utilities: `text-danger` (the `-fg` slot), `bg-danger` / `border-danger` (`-solid`), `bg-danger-subtle` / `border-danger-subtle` (`-bg` / `-border`); same for `success`/`warning`, plus `text-neutral` / `bg-neutral-subtle`. Never raw `success-N`/`warning-N`/`error-N` utilities, nor `text-[var(--status-danger-fg)]` (linter: `no-raw-status-ramp`, which autofixes the latter).
  - A bare `border` sets only the width: always name the colour, `border border-secondary` (linter: `require-border-color`, autofix). Widths are Tailwind's pixel steps, `border`, `border-t`, `border-b-2`, never `border-[1px]` (linter: `no-arbitrary-border-width`, autofix).
  - Never hard-code a hex, `rgb()`/`hsl()` or named colour (style objects, SVG `fill`/`stroke`, chart options, tooltip HTML, SCSS): use a utility, `getChartThemeColors()` for canvas charts, or `currentColor` plus a `text-*` class. ESLint and stylelint (`no-literal-color`) and `yarn colors:check` (CI) fail when a file gains one; after removing some, run `yarn colors:save`.
  - In SCSS, paint brand with `var(--bg-brand-solid)` / `var(--fg-brand-primary)` / `var(--brand-600)`, never `$primary` (a static compile-time green).

- **A static inline style is a class in disguise.** `style={{ maxWidth: '100%', maxHeight: '80px' }}` is `className="max-w-full max-h-20"`, and while it stays inline it outranks every stylesheet, so it also opts the element out of dark mode, responsive variants and the token scales. Sizes map through the px-pinned spacing scale (`minWidth: 160` → `min-w-40`), never Tailwind's rem container scale (`max-w-xl` is 468px here, 432px on a phone). Keep an inline style only for a value computed at render time, a custom property feeding a literal utility (`style={{ '--w': px }}` with `w-[var(--w)]`), a forwarded `style` prop, or a declaration with no utility. Linter enforces this (`no-static-inline-style`); see `docs/design-tokens.md` → "Inline styles"

- **Every class must style something.** A class that neither Tailwind generates nor any stylesheet defines is a typo or a leftover, and paints nothing (linter: `no-unknown-class`, which suggests the nearest real class). See `docs/code-quality.md` → "Unknown class guard"

- Dialogs are waldur-ui's Modal: `openDialog` with `ModalDialog` (`@/modal/ModalDialog`), `ModalShell` for one rendered in place, the `ModalHeader`/`ModalBody`/`ModalFooter` parts for a custom layout; style a part through its `data-slot`. Never a `modal-*` or `btn-close` class — they generate nothing, so `no-unknown-class` reports them (in `dialogClassName`, `bodyClassName` and the other class props too); see `docs/modals.md`

- Lay out with Tailwind grid or flex (`grid grid-cols-1 md:grid-cols-2 gap-x-5`, or `md:grid-cols-12` with `md:col-span-*` children for mixed widths). See `docs/design-tokens.md`.

- Use `waldur-ui`'s `Tabs` (state-driven panels) or `TabNav` (router-driven: `items` with `link: <Link … />`), and `EmbeddedTabs` (`@/table/EmbeddedTabs`) for tabs inside an expandable row or card section. See `docs/tabs.md`

- Use the `waldur-ui` pickers (`DatePicker`, `DateRangePicker`, `MonthPicker`; `DateField`/`DateGroup` in forms) — never a native `<input type="date">`, `datetime-local`, `time`, `month` or `week`. Linter enforces this; see `docs/forms.md` → "Date & Time Pickers"

- Use `waldur-ui`'s `Checkbox`, `Radio`, `Switch` (each takes `label` / `description` / `tooltip` and `checked` + `onCheckedChange`) and `RadioGroup` (options in, value out); in react-final-form use `BooleanGroup` / `RadioGroup` from `@/form`.

- Text inputs are waldur-ui's `Input` / `Textarea` (with `InputGroup` for a start/end adornment and the invalid icon, `NumberInput`, `SecretInput`, `RangeInput`); inside a `FormGroup` use `BaseInputField` / `BaseTextField` from `@/form`, which take the group's control id and a `containerClassName` for the wrapper. Labels, fields and help text are `FormLabel`, `FormField` (`controlId` links label and control) and `FormText` from `waldur-ui`.
- Use waldur-ui's `NativeSelect` for a browser `<select>` (`<option>` children, `sm`/`md`/`lg`, `fit`; `Select` for a searchable list).

- Use **generated filters** for table filter components (see `docs/table/filter-migration-guide.md`):
  1. Add config to `generate-filters-config.yaml`
  2. Run `node generate-filters.cjs`
  3. Import from `@/table/generated/` — never write manual filter components

- Follow UI/UX consistency patterns (see `docs/ui-consistency-guidelines.md`):
  - Use `renderFieldOrDash()` for null/undefined values (never `|| 'N/A'` or `|| ''`)
  - Disabled buttons MUST have tooltip explaining why
  - Use `NoResult` component for all empty states with actionable CTAs
  - Use `hasPermission()` utility for permission checks (not direct `user.is_staff`)
  - Hide buttons when user permanently lacks permission; disable when temporary/fixable
  - Use `useManagedMutation` for all API mutation requests inside modals to cleanly encapsulate success/error notifications, table data reload (`refetch`), and automatic dialog closures. You can also pass `invalidateQueries: [{ queryKey: ['my-key'] }]` to automatically invalidate React Query cache upon success.

- **Read-only rows format through typed property formatters** — a `PropertyItem` whose value is a date, amount, count, boolean, list, meter, … uses the typed formatter from `@/property/propertyFields` (`propVal.date()`, `propVal.currency()`, `propVal.boolean()`, `propVal.count()`, `propVal.meter()`, …), never `value={formatDateTime(x)}`, a Yes/No ternary or `renderFieldOrDash(x)` (the row draws the dash). Linter enforces this (`prefer-typed-property`); see `docs/property-fields.md`

- **Edit Field Architecture** — for any read-only-with-edit row in a details/settings panel, use the pre-bound `*EditField` exports from `@/form/editFields` inside an `EditFieldProvider` (see `docs/forms.md`). Never write a monolithic switch-style `EditFieldDialog` — those have been removed.

  ```tsx
  import {
    EditFieldProvider,
    StringEditField,
    BooleanEditField,
  } from '@/form/editFields';

  <EditFieldProvider scope={offering} callback={update}>
    <StringEditField
      name="service_attributes.backend_url"
      label={translate('API URL')}
      required
    />
    <BooleanEditField
      name="service_attributes.verify_ssl"
      label={translate('Verify SSL')}
      hideLabel
    />
  </EditFieldProvider>;
  ```

  - `callback` receives a partial PATCH body like `{ service_attributes: { backend_url: 'x' } }` (built via `set` from `es-toolkit/compat` from the field's `name` path). The backend endpoint must accept partial updates.
  - For marketplace plugin credentials, compose `BaseCredentialsSection` (`@/marketplace/offerings/update/integration/BaseCredentialsSection`) instead of redoing the layout — it provides the scope state badge and sync button.
  - For multi-section panels with URL-synced tabs, use `TabbedSection` from `@/form/TabbedSection`. Note: `enableSearch` filters by walking direct children only; if a tab's content is a composite subcomponent (e.g. `<BasicInfoTab/>`), the search will treat it as one opaque child. Flatten the fields directly under `<TabbedSection.Tab>` when search is needed.
  - `*EditField`'s `renderValue` may return `null`/`undefined` — the HOC substitutes `DASH_ESCAPE_CODE`, so no explicit dash fallback is needed.
  - `isStaffOnly` on an `*EditField` swaps the edit button for a `StaffOnlyIndicator` for non-staff. For more complex gates, still use `hasPermission()` and wire `hideActions` on the enclosing `PropertyList`/`TabbedSection`.
  - Canonical examples: `src/customer/details/CustomerDetailsPanel.tsx`, `src/openstack/OpenStackCredentialsSection.tsx`, `src/marketplace/offerings/update/integration/LifecyclePolicySection.tsx`.

- **Page content in the layout chrome** (hero, page-tab actions, filter bar, announcement bars) goes through `<LayoutSlot name="…">` rendered in the page's own JSX, only when there is something to show; see `docs/architecture.md` → "Page Content in the Layout Chrome". Never store React elements in a context from an effect to render them elsewhere.

- **`use*` prefix discipline** — do not prefix a utility with `use*` unless it actually calls React hooks. `eslint-plugin-react-hooks` enforces conditional-call ordering by name, so a non-hook helper named `useX` will silently break the lint rule the moment a real hook is added to it, or when callers invoke it after an early return. Use `getXxx`/`computeXxx` for plain functions.

## Sentry Issue Workflow

When given a Sentry URL:

1. **Fetch** - Use `mcp__sentry__get_issue_details` with the URL
2. **Analyze** - Identify root cause from stack trace and browser/environment info
3. **Fix** - Implement the fix
4. **Branch** - Create branch: `fix/sentry-{ISSUE-ID}` (e.g., `fix/sentry-PUHURI-PORTALS-E5C`)
5. **Commit** - Use `[{ISSUE-ID}]` prefix and include `Fixes {ISSUE-ID}` in message body
6. **Push** - Push with `-u origin` to set upstream

## SDK Updates

When new backend API endpoints are needed, regenerate the SDK locally:

```bash
./docs/update-local-sdk.sh ../waldur-mastermind ../js-client
```

This script:

1. Generates OpenAPI schema from MasterMind
2. Generates TypeScript SDK from schema
3. Builds and links `waldur-js-client` locally
4. Regenerates enums and descriptions (FeaturesEnums, SettingsDescription, etc.)

**Prerequisites:** Both `waldur-mastermind` and `js-client` repos must be checked out as siblings.

**After running:** Verify with `yarn tsgo --noEmit`

**Multiple workspaces on one machine:** `yarn link` uses a machine-global registry keyed only by package name, so a second checkout would overwrite the first workspace's `waldur-js-client` link. Set `YARN_LINK_FOLDER` to a workspace-local path to isolate them:

```bash
YARN_LINK_FOLDER=../.yarn-link ./docs/update-local-sdk.sh ../waldur-mastermind ../js-client
```

## Wizard Migration Patterns

When migrating wizard dialogs to use `@/wizard`, follow these patterns:

### Basic Pattern (Standard Wizards)

```tsx
import { Wizard, WizardModal, WizardStepProps } from '@/wizard';

// Define steps
const steps: ProgressStep[] = [
  { key: 'step1', label: translate('Step 1'), completed: false },
  { key: 'step2', label: translate('Step 2'), completed: false },
];

// Create step components
const Step1: FC<WizardStepProps> = (props) => (
  <WizardModal {...props}>
    <Field name="fieldName" component={StringField} />
  </WizardModal>
);

// Use Wizard component
<Wizard
  title={translate('Dialog Title')}
  steps={steps}
  wizardForms={[Step1, Step2]}
  onSubmit={handleSubmit}
  initialValues={initialValues}
/>;
```

### Async Validation Gates

For wizards where steps require API validation before proceeding (e.g., credential validation):

1. **Store all state in form values** - Use `useForm()` and `useFormState()` in steps
2. **Custom footer per step** - Use `renderFooter` prop in `WizardModal`
3. **Async operations update form values** - Validation results stored in form state
4. **Call `props.handleSubmit()` to advance** - After successful validation

```tsx
const CredentialsStep: FC<WizardStepProps> = (props) => {
  const form = useForm<MyFormValues>();
  const { values } = useFormState<MyFormValues>();
  const [validating, setValidating] = useState(false);

  const validateAndContinue = async () => {
    setValidating(true);
    const result = await validateCredentials(values);
    if (result.valid) {
      form.change('credentialsValid', true);
      props.handleSubmit(); // Advance to next step
    }
    setValidating(false);
  };

  const renderFooter = () => (
    <>
      <CloseDialogButton />
      <SubmitButton
        submitting={validating}
        onClick={validateAndContinue}
        label={translate('Validate & Continue')}
      />
    </>
  );

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      ...
    </WizardModal>
  );
};
```

### Custom Footer Buttons

For wizards with non-standard buttons (e.g., "Save as Draft", "Save as Template"):

```tsx
<Wizard
  renderFooter={(props) => (
    <>
      <CloseDialogButton />
      <SubmitButton
        onClick={() => props.form.change('action', 'draft')}
        label={translate('Save as draft')}
      />
      <SubmitButton
        onClick={props.handleSubmit}
        label={translate('Continue')}
      />
    </>
  )}
/>
```

### Form Field Layout (React Final Form)

**Correct pattern for form fields:**

```tsx
import { Field } from 'react-final-form';
import { StringField, SelectField, TextField } from '@/form';
import { FormGroup } from '@/form';

// Each field wrapped in FormGroup for labels, descriptions, spacing
<FormGroup label={translate('Name')} required>
  <Field
    name="name"
    component={StringField}
    placeholder={translate('Enter name...')}
    validate={required}
  />
</FormGroup>

// Side-by-side fields use a Tailwind grid
<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
  <FormGroup label={translate('Start date')} required>
    <Field name="start_date" component={DateField} validate={required} />
  </FormGroup>
  <FormGroup label={translate('End date')} required>
    <Field name="end_date" component={DateField} validate={required} />
  </FormGroup>
</div>
```

**FormGroup props:**

- `label` - Field label text
- `description` - Help text below field
- `required` - Shows red asterisk
- `spaceless` - Removes bottom margin (use on last field)

### Key Lessons Learned

1. **Don't nest forms** - Steps should NOT have their own `<Form>` wrapper when using Wizard
2. **Use `form.change()` for async results** - Store API responses in form values
3. **Footer buttons use `type="button"`** - Prevent accidental form submission
4. **Extract credentials helper** - Create reusable object from form values for API calls
5. **Reset downstream state** - When user changes earlier step selection, clear dependent data

## Exposing New Fields from Backend to Frontend

When a frontend table needs data that isn't available as a top-level field in the API response (e.g., data buried in a JSON `details` blob):

1. **Add a serializer field in waldur-mastermind** — use `SerializerMethodField` with a fallback pattern:

   ```python
   offering_name = serializers.SerializerMethodField()

   @extend_schema_field(serializers.CharField(allow_null=True))
   def get_offering_name(self, obj: models.InvoiceItem) -> str | None:
       # Use direct relationship first
       if obj.resource and obj.resource.offering:
           return obj.resource.offering.name
       # Fallback to details field for backward compatibility
       if obj.details and "offering_name" in obj.details:
           return obj.details["offering_name"]
       return None
   ```

   Add the field to `Meta.fields` tuple. Use `SerializerMethodField` (not `source=`) when the FK can be null and you need a fallback.

2. **Add tests** — test direct relationship, fallback to `details`, and `None` when neither exists.

3. **Regenerate the SDK** — run `./docs/update-local-sdk.sh` so the TypeScript types include the new field.

4. **Update the frontend** — use `row.field_name` directly instead of casting through `details`.

## Task-Specific Docs

These are NOT always-loaded - reference when needed:

- Translation: `yarn i18n:analyze --help` for commands
- MCP Debugging: See `docs/development-setup.md`
- Dependencies: `npm view waldur-js-client versions --json | tail -20`
