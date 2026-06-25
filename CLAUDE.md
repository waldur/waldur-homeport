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

For detailed guidance, see `docs/` — full index with one-line descriptions in `docs/README.md`. Most-used guides:

- `development-workflow.md` - Planning, TDD, problem-solving
- `code-quality.md` - Linting, formatting, TypeScript
- `testing.md` - Frameworks, strategy, unit & E2E standards
- `architecture.md` - Redux, component patterns
- `component-library.md` - UI components, BaseDeployPage
- `api-integration.md` - React Query, CRUD patterns
- `forms.md` - React Final Form and VStepperForm patterns
- `tables.md` - Modular index for useTable, columns, filters, row actions, export, and visual customizations
- `table/filter-migration-guide.md` - Generated table filters from OpenAPI schema
- `development-setup.md` - Build, environment, tooling
- `ui-consistency-guidelines.md` - Empty states, buttons, loading, tooltips

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

- **Edit Field Architecture** — for any read-only-with-edit row in a details/settings panel, use the pre-bound `*EditField` exports from `@/form/editFields` inside an `EditFieldProvider` (see `docs/forms.md`). Never write a monolithic switch-style `EditFieldDialog` — those have been removed.

  ```tsx
  import { EditFieldProvider, StringEditField, BooleanEditField } from '@/form/editFields';

  <EditFieldProvider scope={offering} callback={update}>
    <StringEditField name="service_attributes.backend_url" label={translate('API URL')} required />
    <BooleanEditField name="service_attributes.verify_ssl" label={translate('Verify SSL')} hideLabel />
  </EditFieldProvider>
  ```

  - `callback` receives a partial PATCH body like `{ service_attributes: { backend_url: 'x' } }` (built via `lodash.set` from the field's `name` path). The backend endpoint must accept partial updates.
  - For marketplace plugin credentials, compose `BaseCredentialsSection` (`@/marketplace/offerings/update/integration/BaseCredentialsSection`) instead of redoing the layout — it provides the scope state badge and sync button.
  - For multi-section panels with URL-synced tabs, use `TabbedSection` from `@/form/TabbedSection`. Note: `enableSearch` filters by walking direct children only; if a tab's content is a composite subcomponent (e.g. `<BasicInfoTab/>`), the search will treat it as one opaque child. Flatten the fields directly under `<TabbedSection.Tab>` when search is needed.
  - `*EditField`'s `renderValue` may return `null`/`undefined` — the HOC substitutes `DASH_ESCAPE_CODE`, so no explicit dash fallback is needed.
  - `isStaffOnly` on an `*EditField` swaps the edit button for a `StaffOnlyIndicator` for non-staff. For more complex gates, still use `hasPermission()` and wire `hideActions` on the enclosing `FormTable`/`TabbedSection`.
  - Canonical examples: `src/customer/details/CustomerDetailsPanel.tsx`, `src/openstack/OpenStackCredentialsSection.tsx`, `src/marketplace/offerings/update/integration/LifecyclePolicySection.tsx`.

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

// Side-by-side fields use Bootstrap grid
<div className="row">
  <div className="col-sm-6">
    <FormGroup label={translate('Start date')} required>
      <Field name="start_date" component={DateField} validate={required} />
    </FormGroup>
  </div>
  <div className="col-sm-6">
    <FormGroup label={translate('End date')} required>
      <Field name="end_date" component={DateField} validate={required} />
    </FormGroup>
  </div>
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
