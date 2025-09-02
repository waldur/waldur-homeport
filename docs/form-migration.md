# Form Migration Guide

The application contains **200+ form components** across two patterns, showing gradual migration from Redux Form to React Final Form.

## Form Patterns Comparison

| Aspect | Redux Form (Legacy, 59.5%) | React Final Form (Modern, 30.5%) | VStepperForm (Multi-step, 10%) |
|--------|------------|------------------|---------------------|
| **State Storage** | Redux store | Local component state | Shared across steps |
| **Performance** | Can cause unnecessary re-renders | Optimized subscription model | Step-based validation |
| **Complexity** | More boilerplate required | Minimal boilerplate | Step progression |
| **Persistence** | Persists across unmounts | Local to component lifecycle | Visual progress indicators |
| **Integration** | Deep Redux integration | Isolated, no external dependencies | Complex deployments |

## Implementation Examples

### Redux Form (Legacy)

```typescript
export const PolicyCreateForm: FC<PolicyCreateFormProps> = (props) => (
  <FormContainer submitting={props.submitting}>
    <NumberField name="limit_cost" validate={required} />
    <SelectField name="actions" validate={required} />
  </FormContainer>
);
```

### React Final Form (Modern)

```typescript
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

React Final Form uses reusable field groups for better organization:

```typescript
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

**Benefits**: Separation of concerns, reusability, maintainability, testability

## Key Patterns & Best Practices

### Validation

```typescript
export const validateProjectName = (value, _, props) =>
  checkDuplicate(value, props) || checkPattern(value);
```

### Async Data Integration

```typescript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['CustomerProjects', selectedCustomer?.uuid],
  queryFn: () => fetchCustomerProjects(selectedCustomer.uuid),
});
```

### Modern Form Submission

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

## Migration Strategy

- **New Components**: Use React Final Form
- **Legacy Components**: Maintain Redux Form
- **Hybrid Support**: Common field components work with both
- **Gradual Migration**: Phase out Redux Form over time

## Migration Detailed Guidelines

### Form Distribution

- **Redux Form (Legacy)**: 119 forms (59.5%) - being phased out
- **React Final Form (Modern)**: 61 forms (30.5%) - preferred for new development
- **VStepperForm (Multi-step)**: 20 forms (10%) - complex deployments

### Key Forms by Category

- **User/Auth**: SigninForm, KeyCreateDialog (React Final Form)
- **Projects**: ProjectCreateDialog (React Final Form), team management (Redux Form)
- **Resources**: OpenStack/VMware/Azure provider configs (mostly Redux Form)
- **Administration**: Mixed - newer ones use React Final Form
- **Marketplace**: DeployForm (Redux Form), newer policy forms (React Final Form)

## Post-Migration Cleanup

**Essential Commands**:

```bash
yarn deps:unused           # Remove unused dependencies
yarn lint:check           # Verify code standards
yarn test path/to/tests   # Validate functionality
yarn tsc --noEmit         # Check TypeScript compilation
```

**Cleanup Checklist**:

- [ ] Remove unused Redux Form constants (`FORM_ID`)
- [ ] Convert exported interfaces to internal if only used within component
- [ ] Delete orphaned Redux Form files
- [ ] Update imports to remove unused dependencies
- [ ] Verify form context boundaries for React Final Form
- [ ] Test modal structure and submit button access

## Error Handling Migration

**Issue**: Avoid unhandled promise rejections when migrating error handling.

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

## Component Migration Patterns

### Key Changes in Migration

1. **Form State**: Redux Form HOC → React Final Form `<Form>` component
2. **Initial Values**: `useEffect` with `change` action → `initialValues` prop
3. **Error Handling**: Redux actions → `useNotify` hook
4. **Component Structure**: `FormContainer` wrapper → render prop pattern

### Field Migration

```typescript
// ✅ Standard pattern (preferred)
<Field
  component={StringField as any}
  name="username"
  validate={required}
/>

// ❌ Avoid creating typed adapters
const TypedNumberField = Field as React.ComponentType<any>;
```

### Array Field Migration

```typescript
// Before: Redux Form
const comp = fields.get(i);

// After: React Final Form
const comp = fields.value[i];

// Setup with array mutators
<Form
  mutators={{ ...arrayMutators }}
  render={({ handleSubmit }) => (
    <form onSubmit={handleSubmit}>
      <PolicyCreateForm {...props} />
    </form>
  )}
/>
```

### SDK Types Best Practices

- Use `import { type ComponentUsage } from 'waldur-js-client'`
- Prefer SDK types over custom interfaces
- Handle type conversions: `parseFloat(component.usage)`

## Modal Form Architecture Migration

**Key Issue**: React Final Form context boundaries - submit buttons must be inside `<Form>` component.

**Problem**: `useFormState` called outside form context:

```typescript
// ❌ Problematic structure
<ModalDialog footer={<SubmitButton />}>
  <Form><ResourceForm /></Form>
</ModalDialog>
```

**Solution**: Move submit button inside form context:

```typescript
// ✅ Correct structure
<ModalDialog>
  <Form>
    <ResourceForm />
    <div className="modal-footer">
      <SubmitButton />
    </div>
  </Form>
</ModalDialog>
```

**Migration Steps**:

1. Move submit button inside `<Form>` render function
2. Use `modal-footer` class for styling consistency
3. Remove `footer` prop from `ModalDialog`
4. Test form state access (`useFormState`, `useField`)

## FormGroup Components

**Two Types Available**:

1. **`@waldur/form/FormGroup`** - Redux Form wrapper with comprehensive state management
2. **`@waldur/marketplace/offerings/FormGroup`** - Simple wrapper for labels/help text (preferred for React Final Form)

### FormGroup Migration Patterns

### Replace Manual Label/Field Combinations

```typescript
// ❌ Before - Repetitive manual structure
<div className="mb-7">
  <label className="form-label fw-bolder text-dark fs-6 required">
    {translate('Username')}
  </label>
  <Field component={StringField as any} name="username" />
</div>

// ✅ After - Clean FormGroup wrapper
<FormGroup label={translate('Username')} required>
  <Field component={StringField as any} name="username" />
</FormGroup>
```

### Convert Manual Tooltips to Help Props

```typescript
// ❌ Before - Manual tooltip implementation
<label>
  {translate('Plan')}
  <Tip label={translate('Help text')}>
    <QuestionIcon />
  </Tip>
</label>

// ✅ After - Built-in help prop
<FormGroup
  label={translate('Plan')}
  help={translate('Help text')}
>
  <Field component={SelectField as any} name="period" />
</FormGroup>
```

### Best Practices

1. **Props Effectiveness**: `hideLabel`, `spaceless` don't work with direct Field usage
2. **CSS Classes**: Verify classes exist (avoid non-existent Tailwind classes like `space-y-4`)
3. **Translations**: Make all text including prepositions translatable
4. **FormGroup Choice**: Use marketplace FormGroup for React Final Form

## Architecture Benefits

- **Flexibility**: Multiple form approaches for different use cases
- **Consistency**: Shared field components across form systems
- **Performance**: Modern forms use optimized re-rendering
- **Maintainability**: Clear separation between legacy and modern patterns
- **Developer Experience**: Reduced boilerplate in new forms
