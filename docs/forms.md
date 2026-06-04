# Forms Guide

Waldur HomePort exclusively uses **React Final Form** for standard forms and dialogs, and a custom **VStepperForm** component for complex multi-step wizards.

## Form Patterns Comparison

| Aspect            | React Final Form (Standard)        | VStepperForm (Multi-step)  |
| ----------------- | ---------------------------------- | -------------------------- |
| **State Storage** | Local component state              | Shared across steps        |
| **Performance**   | Optimized subscription model       | Step-based validation      |
| **Complexity**    | Minimal boilerplate                | Step progression           |
| **Persistence**   | Local to component lifecycle       | Visual progress indicators |
| **Integration**   | Isolated, no external dependencies | Complex deployments        |

## Implementation Examples

### React Final Form

The standard form implementation uses a `<Form>` component that provides the `handleSubmit` method to its render prop.

```tsx
import { Form } from 'react-final-form';
import { SubmitButton, StringGroup } from '@/form';

<Form
  onSubmit={onSubmit}
  render={({ handleSubmit, submitting, invalid }) => (
    <form onSubmit={handleSubmit}>
      <StringGroup name="organization" label={translate('Organization')} required />
      <StringGroup name="name" label={translate('Name')} required />
      <SubmitButton submitting={submitting} disabled={invalid} />
    </form>
  )}
/>
```

## Autonomous Field Group Architecture (*Group Pattern)

To reduce boilerplate, improve type safety, and enforce UI consistency, Waldur uses the **Autonomous Field Group** pattern.

We provide a set of components suffixed with `*Group` (e.g., `StringGroup`, `SelectGroup`, `SecretGroup`) created using the `withFormGroup` Higher-Order Component (HOC). These components autonomously bundle:

1. The underlying input component (e.g., `StringField`)
2. React Final Form's `<Field>` wrapper
3. The layout, label, and validation structure via `<FormGroup>`

### ❌ Bad Example: Manual Wrapping (Legacy)

```tsx
import { Field } from 'react-final-form';
import { StringField, FormGroup } from '@/form';
import { translate } from '@/i18n';

// Too much boilerplate, props split between two layers.
<FormGroup
  label={translate('Project name')}
  description={translate('Provide a unique name.')}
  required
>
  <Field
    component={StringField}
    name="name"
    validate={validateProjectName}
    maxLength={150}
  />
</FormGroup>
```

### ✅ Good Example: Autonomous Group (Modern)

```tsx
import { StringGroup } from '@/form';
import { translate } from '@/i18n';

// Clean, single component with unified props!
<StringGroup
  name="name"
  label={translate('Project name')}
  description={translate('Provide a unique name.')}
  required
  validate={validateProjectName}
  maxLength={150}
/>
```

### Rationale & Benefits

1. **Reduced Boilerplate**: You don't need to import `Field`, the base component (`StringField`), and `FormGroup` separately.
2. **Unified Props**: Form layout properties (`label`, `description`, `help`, `required`) and field logic properties (`name`, `validate`, `maxLength`) are cleanly passed to a single component.
3. **Strict Type Checking**: The `withFormGroup` HOC intelligently strips out internal React Final Form props (`component`, `render`) and provides strong IntelliSense for the specific properties required by the underlying input component.
4. **Consistency**: It enforces a single, standardized way to render labeled fields and their associated error messages or tooltips.

### Available Autonomous Groups

Most standard fields have a corresponding `*Group` component exported from `@/form`. A selection includes:

- **Text & Input**: `StringGroup`, `TextGroup`, `SecretGroup`, `NumberGroup`, `EmailGroup`
- **Selection**: `SelectGroup`, `AsyncSelectGroup`, `CreatableSelectGroup`, `BooleanGroup`, `RadioGroup`
- **Advanced**: `DateGroup`, `DateTimeGroup`, `TimeGroup`, `MarkdownGroup`, `MonacoGroup` (Code Editor)
- **Specialized**: `ImageGroup`, `FileUploadGroup`, `CountrySelectGroup`, `CommaSeparatedListGroup`

### When to Use Manual `FormGroup` + `Field`

While autonomous groups are the standard, there are specific architectural exceptions where manually separating `<Form.Group>` (or `FormGroup`) and `<Field>` (or `<FieldArray>`) remains the correct approach:

1. **Complex Arrays (`FieldArray`)**: When mapping over an array of data (e.g., configuring multiple network allocation pools or IP rules), you typically want a single label for the entire collection rather than repeating the label for every row.
2. **Multi-field Inline Layouts**: When several logical fields compose a single input concept (e.g., Start IP and End IP, Min/Max range, X/Y coordinates) that need to be grouped horizontally using `InputGroup` or a table layout.

Example: Array of Inline Inputs

```tsx
import { Form, InputGroup } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { translate } from '@/i18n';

// The Array Renderer
const AllocationPoolsList = ({ fields }) => (
  <>
    {fields.map((name, index) => (
      <InputGroup key={index} className="mb-3">
        {/* Manual Field used here to strip out FormGroup wrappers inside the row */}
        <Field name={`${name}.start`} component="input" className="form-control" />
        <InputGroup.Text>-</InputGroup.Text>
        <Field name={`${name}.end`} component="input" className="form-control" />
      </InputGroup>
    ))}
  </>
);

// The Parent Container
export const NetworkPoolField = () => (
  {/* Manual FormGroup used here as the singular label wrapper for the whole list */}
  <Form.Group>
    <Form.Label>{translate('Allocation pools')}</Form.Label>
    <FieldArray name="allocation_pools" component={AllocationPoolsList} />
    <Form.Text>{translate('Define IP ranges for automatic assignment.')}</Form.Text>
  </Form.Group>
);
```

## Autonomous Table Filters (*Filter Pattern)

Similar to the `*Group` pattern, Waldur provides autonomous components for table filters. These components combine `TableFilterItem`, React Final Form's `Field`, and an input component.

They are created using the `withTableFilter` HOC and handle the toggle button, menu/sidebar layout, and form state binding autonomously.

### Example: Table Filter

```tsx
import { SelectFilter, BooleanFilter } from '@/table';

// Standard select filter
<SelectFilter
  name="state"
  title={translate('State')}
  options={stateOptions}
/>

// Boolean (checkbox) filter
<BooleanFilter
  name="is_active"
  title={translate('Active only')}
  parse={(v) => v || undefined} // Common pattern to remove filter when unchecked
/>
```

### Available Autonomous Filters

- `SelectFilter`: Standard selection
- `AsyncSelectFilter`: Dynamic selection from API
- `BooleanFilter`: Checkbox toggle
- `StringFilter`: Custom text search
- `DateFilter` / `DateTimeFilter`: Date/Time selection
- `NumberFilter` / `NumberRangeFilter`: Numeric selection
- `OfferingFilter`: Specialized offering selector
- `ProjectFilter`: Specialized project selector
- `ProviderFilter`: Specialized service provider selector

## Tooltips & Help Text

Avoid creating manual tooltips or extra label wrappers. Use the built-in `help` or `tooltip` properties provided by the autonomous groups.

```tsx
// ❌ Manual tooltip implementation
<label>
  {translate('Plan')}
  <Tip label={translate('Help text')}>
    <QuestionIcon />
  </Tip>
</label>
<Field component={SelectField} name="period" />

// ✅ Built-in help prop with *Group component
<SelectGroup
  name="period"
  label={translate('Plan')}
  help={translate('Help text')}
/>
```

## Key Patterns & Best Practices

### Validation

Validation functions are pure functions that return an error string if invalid, or `undefined` if valid.

```typescript
export const validateProjectName = (value, _, props) =>
  checkDuplicate(value, props) || checkPattern(value);
```

### Async Data Integration

Use React Query inside forms to load asynchronous data:

```typescript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['CustomerProjects', selectedCustomer?.uuid],
  queryFn: () => fetchCustomerProjects(selectedCustomer.uuid),
});
```

### Modern Form Submission

When writing the submission handler for modal dialogs, use `useManagedMutation` or handle success/error states natively.

```typescript
const onSubmit = async (formData) => {
  try {
    await projectsCreate({ body: formData });
    showSuccess(translate('Project created'));
    closeDialog();
  } catch (e) {
    showErrorResponse(e, translate('Unable to create project'));
  }
};
```

## Error Handling

**Issue**: Avoid unhandled promise rejections when reporting API errors.

**Solution**: Don't re-throw errors after `showErrorResponse()`:

```typescript
// ❌ Before (problematic)
catch (e) {
  showErrorResponse(e, translate('Unable to create key.'));
  throw e; // Causes unhandled promise rejection
}

// ✅ After (correct)
catch (e) {
  showErrorResponse(e, translate('Unable to create key.'));
  // Error handled, no re-throw needed
}
```

## Modal Form Architecture

**Key Issue**: React Final Form context boundaries - submit buttons must be inside the `<Form>` component.

**Solution**: Move submit buttons inside the form context and provide a custom footer structure.

```tsx
// ✅ Correct structure
import { ModalDialog } from '@/modal/ModalDialog';

<Form
  onSubmit={onSubmit}
  render={({ handleSubmit, submitting, invalid }) => (
    <form onSubmit={handleSubmit}>
      <ModalDialog
        title={translate('New Project')}
        footer={
          <SubmitButton submitting={submitting} disabled={invalid} />
        }
      >
        <ResourceForm />
      </ModalDialog>
    </form>
  )}
/>
```

## Advanced Tooling

### Dirty Form Protection

If you want to prevent users from accidentally closing a modal dialog when a form has unsaved changes, use the `DirtyStateReporter` drop-in component anywhere inside your `<Form>` element:

```tsx
import { DirtyStateReporter } from '@/core/DirtyFormContext';

<Form
  onSubmit={onSubmit}
  render={({ handleSubmit }) => (
    <form onSubmit={handleSubmit}>
      <DirtyStateReporter />
      <StringGroup name="name" label={translate('Name')} />
    </form>
  )}
/>
```
