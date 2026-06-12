# Form Agent

Use this agent for all form-related tasks, understanding form implementation patterns, and form architecture best practices using React Final Form.

## Specialization

This agent specializes in:

- **React Final Form**: Modern form implementation standard for Waldur
- **Form Patterns**: 200+ form components using React Final Form and VStepperForm
- **Modal Form Architecture**: Context boundaries and component structure
- **FormGroup Components**: Usage patterns and field organization
- **Validation Patterns**: Field validation, error handling, user experience
- **Array Fields**: FieldArray usage and complex form handling
- **Form Optimization**: Performance and quality assurance

## When to Use

Use this agent when:

- Implementing new form components using React Final Form
- Understanding form implementation patterns and architecture
- Debugging form validation and error handling issues
- Working with complex multi-step forms (VStepperForm)
- Implementing FormGroup components and field organization
- Handling modal forms with context boundary issues
- Creating form field validation and submission patterns

## Form Implementation Distribution

| Type                 | Count            | Status      | Use Case                        |
| -------------------- | ---------------- | ----------- | ------------------------------- |
| **React Final Form** | ~180 forms (90%) | Modern      | Primary implementation standard |
| **VStepperForm**     | ~20 forms (10%)  | Specialized | Complex deployments             |

## Implementation Patterns

### React Final Form

```typescript
export const Component = ({ onSubmit }) => (
  <Form
    onSubmit={onSubmit}
    render={({ handleSubmit, submitting, invalid }) => (
      <form onSubmit={handleSubmit}>
        <Field component={StringField} name="name" />
      </form>
    )}
  />
);
```

## Modal Form Architecture

### Critical Context Boundaries

React Final Form requires all form-related components within `<Form>` context:

**Problematic Structure**:

```typescript
<ModalDialog footer={<SubmitButton />}>
  <Form>
    <FormComponent />
  </Form>
</ModalDialog>
```

**Correct Structure**:

```typescript
<ModalDialog>
  <Form>
    <FormComponent />
    <div className="modal-footer">
      <SubmitButton />
    </div>
  </Form>
</ModalDialog>
```

## FormGroup Components

### Available FormGroup Types

1. **`@/form/FormGroup`** - Unified common wrapper for labels, descriptions, and validation state.
2. **Autonomous Groups** - Unified components like `StringGroup`, `SelectGroup`, `SecretGroup` that bundle `FormGroup`, `Field`, and the input component.

### FormGroup Benefits

- **Reduced Code Duplication**: Eliminates repetitive label/field structures.
- **Consistent Styling**: Automatic spacing with standard Metronic classes.
- **Better Accessibility**: Automatic `controlId` generation for proper label/input association.
- **Unified Props**: Layout props (`label`, `help`, `required`) and field props (`name`, `validate`) are passed to a single component.

### Implementation Patterns

#### ✅ Modern: Autonomous Field Group (Preferred)

Reduces boilerplate by combining the layout and field logic into one component.

```tsx
import { StringGroup } from '@/form';

<StringGroup
  name="username"
  label={translate('Username')}
  help={translate('Help text')}
  required
  validate={required}
/>
```

#### ⚠️ Legacy: Manual FormGroup Wrapping

Used only for complex layouts or `FieldArray` where a single label covers multiple inputs.

```tsx
import { FormGroup, StringField } from '@/form';
import { Field } from 'react-final-form';

<FormGroup
  label={translate('Username')}
  help={translate('Help text')}
  required
>
  <Field component={StringField} name="username" />
</FormGroup>
```

## Validation and Error Handling

### Error Handling

**Best Practice:** For form submissions within modals, prefer using the declarative `useManagedMutation` hook to abstract away the try/catch logic, notifications, and modal closures:

```typescript
const mutation = useManagedMutation({
  mutationFn: (values) => saveData(values),
  successMessage: translate('Saved successfully'),
  errorMessage: translate('Unable to save.'),
});

const onSubmit = (values) => mutation.mutateAsync(values);
```

For manual handling (e.g., when mapped fields should receive validation errors):

```typescript
// React Final Form FORM_ERROR
if (e.response?.status === 400) {
  return e.response.data;
}
catch (e) {
  showErrorResponse(e, translate('Unable to save.'));
}
```

## Array Fields

```typescript
<Form mutators={{ ...arrayMutators }}>
  <FieldArray name="items" validate={required}>
    {(props) => <ItemsList {...props} />}
  </FieldArray>
</Form>
```

## Table Filters

### Autonomous Filters (*Filter Pattern)

Similar to `*Group` components, autonomous filters combine `TableFilterItem`, `Field`, and an input component. They handle the toggle button and layout autonomously.

- **`SelectFilter`**: `@/table` - Standard selection
- **`AsyncSelectFilter`**: `@/table` - API selection
- **`BooleanFilter`**: `@/table` - Checkbox toggle
- **`StringFilter`**: `@/table` - Text search
- **`OfferingFilter`**: `@/marketplace/offerings/details/OfferingFilter` - Offering selector
- **`ProjectFilter`**: `@/marketplace/resources/list/ProjectFilter` - Project selector
- **`ProviderFilter`**: `@/marketplace/orders/ProviderFilter` - Service provider selector

### Usage Pattern

```tsx
import { SelectFilter, BooleanFilter } from '@/table';

<SelectFilter
  name="state"
  title={translate('State')}
  options={options}
/>
<BooleanFilter
  name="is_active"
  title={translate('Active only')}
  parse={(v) => v || undefined}
/>
```

## Quality Assurance

### Essential Validation Commands

1. **Unused Dependencies**: `yarn deps:unused`
2. **Linting**: `yarn lint:check --max-warnings=0`
3. **Type Check**: `yarn tsgo --noEmit`
4. **Tests**: `yarn test path/to/component`

## Best Practices

### Field Typing

- **Standard Pattern**: `<Field component={NumberField} />`
- **SDK Types**: Prefer `waldur-js-client` types over custom interfaces
- **Type Imports**: `import { type ComponentUsage } from 'waldur-js-client'`

### Performance Benefits

- **Local State**: React Final Form eliminates Redux store updates for forms
- **Optimized Re-rendering**: Subscription-based updates
- **Reduced Boilerplate**: Simpler API and less code
