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
- `filter-migration-guide.md` - Generated table filters from OpenAPI schema
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
  const filter = useMemo(() => ({ customer_uuid: customer.uuid }), [customer.uuid]);
  ```

- Use design token button variants (`tertiary`, `danger`, `success`, `text-primary`) - linter enforces this

- Use **generated filters** for table filter components (see `docs/filter-migration-guide.md`):
  1. Add config to `generate-filters-config.yaml`
  2. Run `node generate-filters.cjs`
  3. Import from `@waldur/table/generated/` — never write manual filter components

- Follow UI/UX consistency patterns (see `docs/ui-consistency-guidelines.md`):
  - Use `renderFieldOrDash()` for null/undefined values (never `|| 'N/A'` or `|| ''`)
  - Disabled buttons MUST have tooltip explaining why
  - Use `NoResult` component for all empty states with actionable CTAs
  - Use `hasPermission()` utility for permission checks (not direct `user.is_staff`)
  - Hide buttons when user permanently lacks permission; disable when temporary/fixable

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

**After running:** Verify with `yarn tsc --noEmit`

## Wizard Migration Patterns

When migrating wizard dialogs to use `@waldur/wizard`, follow these patterns:

### Basic Pattern (Standard Wizards)

```tsx
import { Wizard, WizardModal, WizardStepProps } from '@waldur/wizard';

// Define steps
const steps: ProgressStep[] = [
  { key: 'step1', label: translate('Step 1'), completed: false },
  { key: 'step2', label: translate('Step 2'), completed: false },
];

// Create step components
const Step1: FC<WizardStepProps> = (props) => (
  <WizardModal {...props}>
    <Field name="fieldName" component={StringField as any} />
  </WizardModal>
);

// Use Wizard component
<Wizard
  title={translate('Dialog Title')}
  steps={steps}
  wizardForms={[Step1, Step2]}
  onSubmit={handleSubmit}
  initialValues={initialValues}
/>
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

  return <WizardModal {...props} renderFooter={renderFooter}>...</WizardModal>;
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

**NEVER use `FormContainer` from `@waldur/form`** - it wraps children with redux-form's `Field` internally and will cause "Field must be inside a component decorated with reduxForm()" errors.

**Correct pattern for React Final Form:**

```tsx
import { Field } from 'react-final-form';
import { StringField, SelectField, TextField } from '@waldur/form';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

// Each field wrapped in FormGroup for labels, descriptions, spacing
<FormGroup label={translate('Name')} required>
  <Field
    name="name"
    component={StringField as any}
    placeholder={translate('Enter name...')}
    validate={required}
  />
</FormGroup>

// Side-by-side fields use Bootstrap grid
<div className="row">
  <div className="col-sm-6">
    <FormGroup label={translate('Start date')} required>
      <Field name="start_date" component={DateField as any} validate={required} />
    </FormGroup>
  </div>
  <div className="col-sm-6">
    <FormGroup label={translate('End date')} required>
      <Field name="end_date" component={DateField as any} validate={required} />
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
6. **Use FormGroup, not FormContainer** - `FormContainer` is redux-form only; use `FormGroup` from `@waldur/marketplace/offerings/FormGroup` for React Final Form

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
