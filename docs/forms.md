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

To reduce boilerplate, improve type safety, and enforce UI consistency, Waldur uses the **Autonomous Field Group** pattern. A single base input (e.g. `StringField`) is wrapped by three sibling HOCs depending on context — see the [Edit Field Architecture](#edit-field-architecture-editfield-pattern) section below for the full cross-reference table.

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

## Edit Field Architecture (*EditField Pattern)

For details / settings panels that show a value with an inline edit affordance, Waldur uses the **Edit Field Architecture**. It mirrors the `*Group` pattern but renders a read-only `FormTable.Item` plus a button that opens a generic edit modal.

Each base field control has three siblings:

| Base Control           | Form Group (`withFormGroup`) | Edit Field (`withEditField`) | Table Filter (`withTableFilter`) |
| ---------------------- | ---------------------------- | ---------------------------- | --------------------------------- |
| `StringField`          | `StringGroup`                | `StringEditField`            | `StringFilter`                    |
| `SelectField`          | `SelectGroup`                | `SelectEditField`            | `SelectFilter`                    |
| `NumberField`          | `NumberGroup`                | `NumberEditField`            | `NumberFilter`                    |
| `SecretField`          | `SecretGroup`                | `SecretEditField`            | —                                 |
| `EmailField`           | `EmailGroup`                 | `EmailEditField`             | —                                 |
| `AwesomeCheckboxField` | `BooleanGroup`               | `BooleanEditField`           | `BooleanFilter`                   |
| `DateField`            | `DateGroup`                  | `DateEditField`              | —                                 |
| `MarkdownEditor`       | `MarkdownGroup`              | `MarkdownEditField`          | —                                 |

Exports live in `@/form/editFields`. To make a custom field editable, run the base component through the HOC:

```tsx
import { withEditField } from '@/form/editFields';

const ExternalIpsEditField = withEditField(OpenStackExternalIpsField);
```

### Provider + field usage

`EditFieldProvider` supplies the `scope` (the object being edited) and the `callback` (the persist function) so individual edit fields don't need to be threaded with props.

```tsx
import {
  EditFieldProvider,
  StringEditField,
  BooleanEditField,
  SelectEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';

<EditFieldProvider scope={offering} callback={update}>
  <FormTable>
    <StringEditField
      name="service_attributes.backend_url"
      label={translate('API URL')}
      required
      validate={required}
    />
    <SelectEditField
      name="service_attributes.auth_type"
      label={translate('Authentication type')}
      options={AUTH_TYPE_OPTIONS}
      simpleValue
      isClearable={false}
    />
    <BooleanEditField
      name="service_attributes.verify_ssl"
      label={translate('Verify SSL')}
      hideLabel
    />
  </FormTable>
</EditFieldProvider>
```

### Callback contract

When the user submits the modal, the dialog builds a body via `lodash.set({}, field.name, value)` and passes it to the provider's `callback`. The callback receives a **partial** PATCH-shaped object:

```ts
// User edited service_attributes.backend_url
callback({ service_attributes: { backend_url: 'https://keystone…' } });

// User edited backend_id
callback({ backend_id: 'abc-123' });
```

The backend endpoint behind `callback` must therefore accept partial updates (PATCH semantics). The marketplace `marketplaceProviderOfferingsUpdateIntegration` endpoint and `projectsPartialUpdate` / `customersPartialUpdate` already do. Wrap the persist call in `useManagedMutation` so success/error notifications and `closeDialog` are handled uniformly.

### Common props

- `name` — dotted path into `scope` (e.g. `service_attributes.backend_url`). Reads via `lodash.get`, writes via `lodash.set`.
- `label`, `description`, `required`, `validate`, `format`, `parse`, `normalize` — passed through to the modal's `<Field>`.
- `isStaffOnly` — non-staff users see a `<StaffOnlyIndicator/>` instead of the edit button; the read-only value is still visible.
- `renderValue(value)` — override the read-only display. May return `null`/`undefined`; the HOC substitutes `DASH_ESCAPE_CODE`, so no manual dash fallback is needed.
- `tooltip`, `iconNode` — propagate to the compact edit button (e.g. to flag IDP-managed fields with a lock icon).
- `warnTooltip` — displays a warning marker next to the row's value, e.g. for fields with non-obvious side effects.
- Any other prop is forwarded to the inner field when the modal opens — e.g. `placeholder` on `CommaSeparatedListEditField` reaches `CommaSeparatedListField`.

For panel-wide access control, pass `hideActions={!canUpdate}` to the enclosing `<FormTable>` (or `TabbedSection`) — it hides the entire action column without conditional JSX around every field.

### Marketplace plugin credentials

For plugin credentials, compose `BaseCredentialsSection` (`@/marketplace/offerings/update/integration/BaseCredentialsSection`) instead of redoing the layout — it provides the scope state badge, the sync button, and the surrounding `EditFieldProvider` wired to the offering's `update` mutation:

```tsx
import { BaseCredentialsSection } from '@/marketplace/offerings/update/integration/BaseCredentialsSection';
import { StringEditField, SecretEditField } from '@/form/editFields';

export const MyPluginCredentialsSection = (props) => (
  <BaseCredentialsSection {...props}>
    <StringEditField name="service_attributes.api_url" label={translate('API URL')} required />
    <SecretEditField name="secret_options.api_token" label={translate('API token')} required />
  </BaseCredentialsSection>
);
```

### Tabbed panels

For multi-section panels with URL-synced tabs, use `TabbedSection` from `@/form/TabbedSection`:

```tsx
import { TabbedSection } from '@/form/TabbedSection';

<EditFieldProvider scope={offering} callback={update}>
  <TabbedSection enableSearch>
    <TabbedSection.Tab id="filtering" title={translate('Filtering')}>
      <StringEditField name="service_attributes.flavor_exclude_regex" label={…} />
    </TabbedSection.Tab>
    <TabbedSection.Tab id="network" title={translate('Network')}>
      <BooleanEditField name="plugin_options.lbaas_enabled" label={…} />
    </TabbedSection.Tab>
  </TabbedSection>
</EditFieldProvider>
```

**Search caveat**: `enableSearch` filters by walking direct children only. If a tab's content is a composite subcomponent (e.g. `<BasicInfoTab/>`), search treats it as a single opaque child. Place `*EditField`s directly under `<TabbedSection.Tab>` when search is needed.

### Don't do this

- ❌ Don't add fields to a monolithic switch-based `EditFieldDialog`. The legacy `src/customer/details/EditFieldDialog.tsx`, `src/user/support/EditFieldDialog.tsx`, etc. have all been removed.
- ❌ Don't write your own edit button + `openDialog(SomeEditDialog, …)` lazy loader when an `*EditField` would do — the standardized dialog handles validation, dirty-state, and submit wiring for you.
- ❌ Don't render `*EditField` outside an `EditFieldProvider`. The HOC throws — you'll see `<withEditField(X)>: "scope" and "callback" must be provided…`.
- ❌ Don't pass a component that is already wrapped with `withFormGroup` to `withEditField`. The edit dialog injects its own label, so a `*Group` component produces double labels — wrap the base field (e.g. `StringField`) instead.
- ❌ Don't manually check for empty values with ternary operators — `withEditField` renders a dash (`—`) for missing values automatically.

Canonical examples:

- `src/customer/details/CustomerDetailsPanel.tsx` — `TabbedSection` + multiple tabs of `*EditField`s.
- `src/openstack/OpenStackCredentialsSection.tsx` — `BaseCredentialsSection` with `Select`/`Boolean`/`Secret` edit fields.
- `src/marketplace/offerings/update/integration/LifecyclePolicySection.tsx` — search-enabled tabs with flat field lists.

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

## Tabbed Sections (`TabbedSection`)

When building complex forms with many fields, use the `TabbedSection` component to organize fields into logical, URL-synced tabs. It includes built-in support for searching across tabs and automatically jumping to tabs with matching results.

### Example Usage

```tsx
import { EditFieldProvider, StringEditField, BooleanEditField } from '@/form/editFields';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';

export const MySettingsPanel = ({ settings, update, canUpdate }) => (
  <EditFieldProvider scope={settings} callback={update}>
    <TabbedSection title={translate('Settings')} enableSearch hideActions={!canUpdate}>
      <TabbedSection.Tab id="general" title={translate('General')}>
        <StringEditField name="name" label={translate('Name')} />
        <BooleanEditField name="is_active" label={translate('Active')} />
      </TabbedSection.Tab>

      <TabbedSection.Tab id="advanced" title={translate('Advanced')}>
        <StringEditField name="api_key" label={translate('API Key')} />
      </TabbedSection.Tab>
    </TabbedSection>
  </EditFieldProvider>
);
```

### Key Features

1. **URL Synchronization**: Automatically syncs the active tab to the URL query string using `useSettingsUrlSync`, allowing users to share links to specific tabs.
2. **Built-in Search (`enableSearch`)**: When enabled, provides a search input that filters fields across all tabs by matching against their `label` and `description` props.
3. **Auto-jump**: When searching, if the current tab yields no results, it automatically jumps to the first tab containing matching fields.
4. **Field Counters**: Displays a badge on each tab showing the number of matching fields during a search.
5. **FormTable Integration**: Automatically wraps the tab's fields in a `FormTable` for consistent alignment and styling.
