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

```typescript
import { Form } from 'react-final-form';
import { SubmitButton } from '@/form';

<Form
  onSubmit={onSubmit}
  render={({ handleSubmit, submitting, invalid }) => (
    <form onSubmit={handleSubmit}>
      <OrganizationGroup />
      <NameGroup />
      <SubmitButton submitting={submitting} disabled={invalid} />
    </form>
  )}
/>
```

## Field Group Pattern

We use reusable field groups for better organization, separating the structure from the actual logic:

```typescript
import { Field } from 'react-final-form';
import { StringField } from '@/form';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { translate } from '@/i18n';

export const NameGroup = ({ customer }) => (
  <FormGroup label={translate('Project name')} required>
    <Field
      component={StringField as any}
      name="name"
      validate={validateProjectName}
      customer={customer}
    />
  </FormGroup>
);
```

**Benefits**: Separation of concerns, reusability, maintainability, testability.

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

```typescript
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

## FormGroup Components

We have multiple `FormGroup` components, but you should favor the standard wrapper:

1. **`@/marketplace/offerings/FormGroup`** - Clean wrapper for labels/help text.

### Replace Manual Label/Field Combinations

```typescript
// ❌ Avoid repetitive manual structure
<div className="mb-7">
  <label className="form-label fw-bolder text-dark fs-6 required">
    {translate('Username')}
  </label>
  <Field component={StringField as any} name="username" />
</div>

// ✅ Use clean FormGroup wrapper
<FormGroup label={translate('Username')} required>
  <Field component={StringField as any} name="username" />
</FormGroup>
```

### Convert Manual Tooltips to Help Props

```typescript
// ❌ Manual tooltip implementation
<label>
  {translate('Plan')}
  <Tip label={translate('Help text')}>
    <QuestionIcon />
  </Tip>
</label>

// ✅ Built-in help prop
<FormGroup
  label={translate('Plan')}
  help={translate('Help text')}
>
  <Field component={SelectField as any} name="period" />
</FormGroup>
```

## Advanced Tooling

### Dirty Form Protection

If you want to prevent users from accidentally closing a modal dialog when a form has unsaved changes, use the `DirtyStateReporter` drop-in component anywhere inside your `<Form>` element:

```typescript
import { DirtyStateReporter } from '@/core/DirtyFormContext';

<Form
  onSubmit={onSubmit}
  render={({ handleSubmit }) => (
    <form onSubmit={handleSubmit}>
      <DirtyStateReporter />
      <FormGroup label={translate('Name')}>
        <Field component={StringField as any} name="name" />
      </FormGroup>
    </form>
  )}
/>
```
