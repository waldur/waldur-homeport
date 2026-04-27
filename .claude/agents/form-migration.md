# Form Migration Agent

Use this agent for all form-related tasks, including migrating Redux Form components to React Final Form, understanding form implementation patterns, and form architecture best practices.

## Specialization

This agent specializes in:
- **Form Migration**: Redux Form to React Final Form transitions
- **Form Patterns**: 200+ form components across Redux Form, React Final Form, VStepperForm
- **Modal Form Architecture**: Context boundaries and component structure
- **FormGroup Components**: Usage patterns and refactoring strategies
- **Validation Patterns**: Field validation, error handling, user experience
- **Array Fields**: FieldArray migration and complex form handling
- **Form Cleanup**: Post-migration verification and quality assurance

## When to Use

Use this agent when:
- Migrating Redux Form components to React Final Form
- Understanding form implementation patterns and architecture
- Debugging form validation and error handling issues
- Working with complex multi-step forms (VStepperForm)
- Implementing FormGroup components and field organization
- Handling modal forms with context boundary issues
- Creating form field validation and submission patterns
- Performing post-migration cleanup and verification

## Form Implementation Distribution

| Type | Count | Status | Use Case |
|------|-------|--------|----------|
| **Redux Form** | ~119 forms (59.5%) | Legacy | Being phased out |
| **React Final Form** | ~61 forms (30.5%) | Modern | Preferred for new development |
| **VStepperForm** | ~20 forms (10%) | Specialized | Complex deployments |

## Migration Patterns

### Redux Form → React Final Form

**Before (Redux Form)**:
```typescript
export const Component = reduxForm({ form: FORM_ID })(
  ({ handleSubmit, submitting, invalid }) => (
    <form onSubmit={handleSubmit(callback)}>
      <FormContainer submitting={submitting}>
        <Field component={StringField} name="name" />
      </FormContainer>
    </form>
  )
);
```

**After (React Final Form)**:
```typescript
export const Component = ({ onSubmit }) => (
  <Form
    onSubmit={onSubmit}
    render={({ handleSubmit, submitting, invalid }) => (
      <form onSubmit={handleSubmit}>
        <Field component={StringField as any} name="name" />
      </form>
    )}
  />
);
```

### Key Migration Changes
1. **Form State**: Redux HOC → `<Form>` component
2. **Initial Values**: `initialValues` prop instead of `useEffect` + `change`
3. **Error Handling**: `useNotify` hook instead of Redux actions
4. **Field Pattern**: Standard `<Field component={FieldType as any} />`

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
1. **`@/form/FormGroup`** - Redux Form wrapper with state management
2. **`@/marketplace/offerings/FormGroup`** - Simple wrapper for labels/help

### FormGroup Benefits
- **Reduced Code Duplication**: Eliminates repetitive label/field structures
- **Consistent Styling**: Automatic spacing with `mb-7`
- **Better Accessibility**: Proper label associations
- **Tooltip Support**: Built-in help text with `help` prop

### Usage Pattern
```typescript
<FormGroup 
  label={translate('Username')} 
  help={translate('Help text')}
  required
>
  <Field component={StringField as any} name="username" />
</FormGroup>
```

## Validation and Error Handling

### Error Handling Migration
```typescript
// Before: Redux Form SubmissionError
if (e.response?.status === 400) {
  throw new SubmissionError(e.response.data);
}

// After: React Final Form FORM_ERROR
if (e.response?.status === 400) {
  return e.response.data;
}
catch (e) {
  showErrorResponse(e, translate('Unable to save.'));
  // No need to re-throw - error is handled
}
```

## Array Field Migration

### Redux Form to React Final Form Arrays
```typescript
// Before: Redux Form FieldArray
<FieldArray
  name="items"
  component={ItemsList}
  validate={required}
/>

// After: React Final Form FieldArray
<Form mutators={{ ...arrayMutators }}>
  <FieldArray name="items" validate={required}>
    {(props) => <ItemsList {...props} />}
  </FieldArray>
</Form>
```

## Post-Migration Cleanup

### Essential Cleanup Commands
1. **Unused Dependencies**: `yarn deps:unused`
2. **Linting**: `yarn lint:check --max-warnings=0`
3. **Type Check**: `yarn tsc --noEmit`
4. **Tests**: `yarn test path/to/migration`

### Cleanup Checklist
- [ ] Remove unused Redux Form constants (FORM_ID)
- [ ] Convert exported interfaces to internal if only used locally
- [ ] Delete orphaned files from Redux Form implementation
- [ ] Update import statements to remove unused imports
- [ ] Verify form context boundaries in modals
- [ ] Test form functionality and visual consistency

## Best Practices

### Field Typing
- **Standard Pattern**: `<Field component={NumberField as any} />`
- **SDK Types**: Prefer `waldur-js-client` types over custom interfaces
- **Type Imports**: `import { type ComponentUsage } from 'waldur-js-client'`

### Performance Benefits
- **Local State**: React Final Form eliminates Redux store updates
- **Optimized Re-rendering**: Subscription-based updates
- **Reduced Boilerplate**: Simpler API and less code

### Migration Strategy
1. **Legacy Maintenance**: Existing Redux Forms remain functional
2. **New Development**: All new forms use React Final Form
3. **Selective Migration**: Critical forms migrated first
4. **Hybrid Support**: Common field components work with both systems