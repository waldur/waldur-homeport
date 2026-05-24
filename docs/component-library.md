# Component Library Guide

This guide covers the comprehensive set of reusable UI components and specialized patterns used throughout Waldur HomePort.

## Common UI Widgets and Reusable Components

The application features a comprehensive set of reusable UI components organized by category:

### Tables and Data Display

| Component | Location | Description | Key Features |
|-----------|----------|-------------|--------------|
| **Table** | `src/table/Table.tsx` | Main table component | Filtering, sorting, pagination, column visibility, export |
| **ActionsDropdown** | `src/table/ActionsDropdown.tsx` | Dropdown for table actions | Bulk operations, contextual actions |
| **ExpandableContainer** | `src/table/ExpandableContainer.tsx` | Collapsible row details | Table row expansion, detail views |
| **TablePagination** | `src/table/TablePagination.tsx` | Pagination controls | Page navigation, size selection |

### Forms and Input Components

| Component | Location | Description | Key Features |
|-----------|----------|-------------|--------------|
| **WizardForm** | `src/wizard/WizardForm.tsx` | Multi-step form wizard | Step navigation, validation, progress indicator |
| **VStepperFormStepCard** | `src/wizard/VStepperFormStep.tsx` | Card-based form step | Loading state, disabled state with tooltip |
| **AwesomeCheckbox** | `src/core/AwesomeCheckbox.tsx` | Enhanced checkbox | Switch-style, tooltip support |
| **SelectField** | `src/form/SelectField.tsx` | Dropdown selection | Options, search, validation |
| **StringField** | `src/form/StringField.tsx` | Text input field | Validation, placeholder, help text |
| **NumberField** | `src/form/NumberField.tsx` | Numeric input | Min/max validation, step control |
| **DateField** | `src/form/DateField.tsx` | Date picker | Date selection, validation |
| **FileUploadField** | `src/form/FileUploadField.tsx` | File upload | Drag & drop, validation |
| **MarkdownEditor** | `src/form/MarkdownEditor.tsx` | Markdown editor | Preview, syntax highlighting |
| **SecretField** | `src/form/SecretField.tsx` | Password/secret input | Show/hide toggle, validation |

### Button Components

The application uses a unified button system. **Never import Bootstrap Button directly** - use the appropriate Waldur wrapper component.

#### Core Button Components

| Component | Location | Description | Key Features |
|-----------|----------|-------------|--------------|
| **ActionButton** | `src/table/ActionButton.tsx` | General purpose action button | Tooltip, loading state, icon support, multiple variants |
| **RowActionButton** | `src/table/ActionButton.tsx` | Optimized for table rows | Smaller touch target, row context |
| **CompactActionButton** | `src/table/CompactActionButton.tsx` | Small inline actions | Compact size for tight spaces |
| **SubmitButton** | `src/form/SubmitButton.tsx` | Form submission | Loading spinner, disabled states, large size |
| **CompactSubmitButton** | `src/form/CompactSubmitButton.tsx` | Compact form submission | Small size for popovers/inline forms |
| **EditButton** | `src/form/EditButton.tsx` | Edit navigation/dialogs | Large size, edit icon |
| **CompactEditButton** | `src/form/CompactEditButton.tsx` | Edit button for key-value rows | Used in key-value component where label and edit button appear in the same row |
| **CloseDialogButton** | `src/modal/CloseDialogButton.tsx` | Modal cancel/close | Auto-closes dialog, customizable label |
| **IconButton** | `src/core/buttons/IconButton.tsx` | Icon-only with tooltip | Required tooltip for accessibility |
| **ToolbarButton** | `src/table/ToolbarButton.tsx` | Table/panel toolbars | Badge support, consistent toolbar styling |
| **SaveButton** | `src/core/SaveButton.tsx` | Form save with dirty state | Tracks form changes, conditional visibility |

#### Button Selection Guide

| Use Case | Component | Size |
|----------|-----------|------|
| Form submit | `SubmitButton` | `lg` |
| Form submit in popover/inline form | `CompactSubmitButton` | `sm` |
| Table row action | `ActionButton` or `RowActionButton` | `lg` |
| Inline action in tight spaces | `CompactActionButton` | `sm` |
| Modal cancel/close | `CloseDialogButton` | `lg` |
| Icon-only button | `IconButton` | — |
| Table toolbar buttons | `ToolbarButton` or `IconButton` | — |
| Edit button in key-value component row | `CompactEditButton` | `sm` |
| Edit in card/panel header | `EditButton` | `lg` |
| Create with dialog | `CreateModalButton` | `lg` |
| Delete with confirmation | `DeleteButton` | `lg` |

#### ActionButton Usage

```tsx
import { ActionButton } from '@/table/ActionButton';

// Basic usage
<ActionButton
  title={translate('Edit')}
  action={() => handleEdit()}
  iconNode={<PencilIcon weight="bold" />}
/>

// With loading state
<ActionButton
  title={translate('Save')}
  action={handleSave}
  pending={isSaving}
  variant="primary"
/>

// Disabled with tooltip
<ActionButton
  title={translate('Delete')}
  action={handleDelete}
  disabled={!canDelete}
  tooltip={!canDelete ? translate('Cannot delete active item') : undefined}
  variant="danger"
/>
```

#### SubmitButton Usage

```tsx
import { SubmitButton } from '@/form';

// In a form
<SubmitButton
  submitting={submitting}
  disabled={pristine || invalid}
  label={translate('Save changes')}
/>

// As action button (non-submit)
<SubmitButton
  type="button"
  variant="success"
  onClick={handleAccept}
  submitting={isAccepting}
  label={translate('Accept')}
  iconNode={<CheckIcon weight="bold" />}
  iconOnLeft
/>
```

#### CloseDialogButton Usage

```tsx
import { CloseDialogButton } from '@/modal/CloseDialogButton';

// Simple close
<Modal.Footer>
  <CloseDialogButton />
  <SubmitButton submitting={submitting} label={translate('Save')} />
</Modal.Footer>

// Custom label
<CloseDialogButton label={translate('Discard')} />

// With custom handler
<CloseDialogButton onClick={handleCancel} disabled={submitting} />
```

#### IconButton Usage

```tsx
import { IconButton } from '@/core/buttons/IconButton';

// Toolbar refresh button
<IconButton
  iconNode={<ArrowsClockwiseIcon weight="bold" />}
  tooltip={translate('Refresh')}
  onClick={handleRefresh}
/>

// With pending state
<IconButton
  iconNode={<DownloadIcon weight="bold" />}
  tooltip={translate('Export')}
  onClick={handleExport}
  pending={isExporting}
/>
```

### Modal and Dialog Components

| Component | Location | Description | Key Features |
|-----------|----------|-------------|--------------|
| **ModalDialog** | `src/modal/ModalDialog.tsx` | Base modal component | Header, body, footer, icon support |
| **ConfirmationDialog** | `src/modal/ConfirmationDialog.tsx` | Confirmation modal | Destructive actions, custom text |
| **ActionDialog** | `src/modal/ActionDialog.tsx` | Generic action dialog | Form support, validation |

### Button Factory Components

Generic button factories that reduce boilerplate for common CRUD operations:

| Component | Location | Description | Key Features |
|-----------|----------|-------------|--------------|
| **CreateModalButton** | `src/core/buttons/CreateModalButton.tsx` | Factory for create buttons | Opens dialog with resolve props, primary variant |
| **EditModalButton** | `src/core/buttons/EditModalButton.tsx` | Factory for edit buttons | Supports buildResolve, getInitialValues, action-item or button mode |
| **DeleteButton** | `src/core/buttons/DeleteButton.tsx` | Factory for delete buttons | Confirmation dialog, API call, success/error notifications |

#### CreateModalButton Usage

```tsx
import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const MyDialog = lazyComponent(() =>
  import('./MyDialog').then((m) => ({ default: m.MyDialog })),
);

export const MyCreateButton = ({ refetch }) => (
  <CreateModalButton
    dialog={MyDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
```

#### EditModalButton Usage

```tsx
import { EditModalButton } from '@/core/buttons';

export const MyEditButton = ({ row, refetch }) => (
  <EditModalButton
    dialog={MyUpdateDialog}
    row={row}
    buildResolve={(r) => ({ uuid: r.uuid, refetch })}
    getInitialValues={(r) => ({ name: r.name })}
    size="lg"
    title={translate('Update')}
  />
);
```

#### DeleteButton Usage

```tsx
import { DeleteButton } from '@/core/buttons';
import { myItemDestroy } from 'waldur-js-client';

export const MyDeleteButton = ({ row, refetch }) => (
  <DeleteButton
    row={row}
    apiFunction={(r) => myItemDestroy({ path: { uuid: r.uuid } })}
    confirmTitle={translate('Delete item')}
    confirmMessage={(r) => translate(
      'Are you sure you want to delete {name}?',
      { name: <strong>{r.name}</strong> },
      formatJsxTemplate
    )}
    successMessage={translate('Item deleted.')}
    errorMessage={translate('Unable to delete item.')}
    refetch={refetch}
  />
);
```

### Navigation Components

| Component | Location | Description | Key Features |
|-----------|----------|-------------|--------------|
| **TabsList** | `src/navigation/TabsList.tsx` | Tab navigation | Nested dropdowns, active detection |
| **Layout** | `src/navigation/Layout.tsx` | Application layout | Responsive, sidebar, header |
| **Breadcrumbs** | `src/navigation/header/breadcrumb/Breadcrumbs.tsx` | Navigation breadcrumbs | Hierarchical navigation |

### Cards and Layout Components

| Component | Location | Description | Key Features |
|-----------|----------|-------------|--------------|
| **Panel** | `src/core/Panel.tsx` | Basic card panel | Header, actions, flexible content |
| **AccordionCard** | `src/core/AccordionCard.tsx` | Collapsible card | Toggle functionality, custom styling |
| **WidgetCard** | `src/dashboard/WidgetCard.tsx` | Dashboard widget | Flexible layout, action dropdown |
| **StatisticsCard** | `src/core/StatisticsCard.tsx` | Statistics display | Large value display, "View all" link |

### Data Display Components

| Component | Location | Description | Key Features |
|-----------|----------|-------------|--------------|
| **Badge** | `src/core/Badge.tsx` | Status indicator | Multiple variants, icon support, tooltip |
| **StateIndicator** | `src/core/StateIndicator.tsx` | Status with animation | Loading animation, color variants |
| **BooleanBadge** | `src/core/BooleanBadge.tsx` | Boolean indicator | Yes/No display, true/false states |
| **TruncatedText** | `src/core/TruncatedText.tsx` | Responsive text | Automatic truncation, expandable |
| **TruncatedDescription** | `src/core/TruncatedDescription.tsx` | Description text | Read more/less functionality |
| **ImagePlaceholder** | `src/core/ImagePlaceholder.tsx` | Image fallback | Automatic sizing, circular option |
| **Avatar** | `src/core/Avatar.tsx` | User avatar | Profile pictures, initials fallback |

### Loading and State Components

| Component | Location | Description | Key Features |
|-----------|----------|-------------|--------------|
| **LoadingSpinner** | `src/core/LoadingSpinner.tsx` | Loading indicator | Consistent styling, size variants |
| **LoadingErred** | `src/core/LoadingErred.tsx` | Error state display | Error handling, retry actions |

### Chart and Visualization

| Component | Location | Description | Key Features |
|-----------|----------|-------------|--------------|
| **EChart** | `src/core/EChart.tsx` | Apache ECharts wrapper | Theme support, export functionality |
| **EChartActions** | `src/core/EChartActions.tsx` | Chart actions | Export buttons, chart controls |

### Utility Components

| Component | Location | Description | Key Features |
|-----------|----------|-------------|--------------|
| **CopyToClipboard** | `src/core/CopyToClipboard.tsx` | Copy functionality | Click to copy, success feedback |
| **CopyToClipboardButton** | `src/core/CopyToClipboardButton.tsx` | Copy button | Icon button, tooltip |
| **Tooltip** | `src/core/Tooltip.tsx` | Tooltip wrapper | Help text, positioning |
| **ProgressSteps** | `src/wizard/ProgressSteps.tsx` | Step indicator | Multi-step processes, progress |

## Component Design Principles

- **TypeScript interfaces** for comprehensive type safety
- **Consistent styling** using React Bootstrap and custom classes
- **Accessibility features** with proper ARIA attributes
- **Responsive design** with mobile-first approach
- **Theme support** with light/dark mode compatibility
- **Loading states** with integrated spinner functionality
- **Error handling** with proper error boundaries
- **Internationalization** with translate function usage

These components provide a comprehensive foundation for building consistent, accessible, and maintainable UI throughout the Waldur HomePort application.

## BaseDeployPage Component Pattern

The **BaseDeployPage** component (located at `src/marketplace/deploy/DeployPage.tsx`) serves as the central foundation for all marketplace offering deployment/ordering flows. It provides a standardized, multi-step form interface that can be configured for different types of cloud resources and services.

### Architecture and Purpose

BaseDeployPage handles:

- **Step Management**: Progressive form steps with validation and completion tracking
- **State Management**: Integration with React Final Form for form state and user selections
- **Form Validation**: Real-time validation and error display
- **Layout Management**: Sidebar layout with progress tracking
- **API Integration**: Order submission and error handling
- **Context-Aware Initialization**: Auto-populates organization/project based on context

### Key Configuration Interface

```js
interface DeployPageProps {
  offering: Offering;
  limits?: string[];
  updateMode?: boolean;
  previewMode?: boolean;
  order?: OrderResponse;
  plan?: Plan;
  initialLimits?: AttributesType;
  inputFormSteps: OfferingConfigurationFormStep[]; // Main configuration
}
```

### Step Definition Structure

```js
interface VStepperFormStep<T = VStepperFormStepProps> {
  label: string;                    // Display name
  id: string;                      // Unique identifier
  component: React.ComponentType<T>; // React component to render
  params?: Record<string, any>;    // Additional configuration
  fields?: Array<string>;          // Form fields managed by this step
  required?: boolean;              // Whether step is mandatory
  requiredFields?: Array<string>;  // Fields that must be completed
  isActive?: (data?: any) => boolean; // Dynamic step visibility
}
```

### Usage Example: OpenstackInstanceOrder

```js
// src/openstack/openstack-instance/OpenstackInstanceOrder.tsx
export const OpenstackInstanceOrder = (props) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
```

**Step Configuration:**

```js
// src/openstack/openstack-instance/deploy/steps.ts
export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,           // Organization/Project selection
  FormCloudStep,                 // Cloud region (if shared offering)
  FormImageStep,                 // VM image selection
  FormHardwareConfigurationStep, // Flavor, storage configuration
  FormNetworkSecurityStep,       // Network and security groups
  FormStartupScriptStep,         // Automation/user data
  FormFinalConfigurationStep,    // Name, description
];
```

### Common Implementation Pattern

All offering types follow the same pattern:

1. **Define Steps**: Create array of `OfferingConfigurationFormStep` objects
2. **Wrap BaseDeployPage**: Pass steps as `inputFormSteps` prop
3. **Register in Marketplace**: Register in `src/marketplace/common/registry.ts`

**Other Examples:**

- `OpenstackVolumeOrder` - Volume deployment
- `OpenstackTenantOrder` - Tenant creation
- `RancherOrderForm` - Rancher cluster deployment
- `RequestOrderForm` - Support requests

### Key Features

#### Dynamic Step Filtering

```js
const formSteps = useMemo(
  () =>
    inputFormSteps.filter(
      (step) => (step.isActive && step.isActive(selectedOffering)) ?? true,
    ),
  [selectedOffering],
);
```

#### Progressive Validation

- Tracks completed steps based on required field validation
- Uses scroll position to mark optional steps as "seen"
- Real-time validation feedback with error display

#### Multiple Operation Modes

- **Create Mode**: New resource deployment
- **Update Mode**: Editing existing orders with pre-populated values
- **Preview Mode**: Read-only display of form steps

### Integration with Marketplace System

#### Registry Configuration

```js
export const OpenStackInstanceOffering: OfferingConfiguration = {
  type: INSTANCE_TYPE,
  orderFormComponent: OpenstackInstanceOrder,
  detailsComponent: OpenstackInstanceDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer: instanceSerializer,
  // ... other configuration
};
```

#### Sidebar Integration

The `DeployPageSidebar` provides:

- Progress tracking with step completion status
- Error display for validation issues
- Checkout summary with pricing information
- Order summary customizable per offering type

### Best Practices

1. **Consistent Step Structure**: All offering types use the same step interface
2. **Lazy Loading**: Components are lazy-loaded for better performance
3. **Type Safety**: Strong TypeScript typing throughout
4. **Reusable Components**: Common steps like `DetailsOverviewStep` are shared
5. **Error Handling**: Comprehensive validation and error display
6. **Accessibility**: Proper ARIA labels and keyboard navigation

The BaseDeployPage component represents a well-architected, reusable foundation that allows different cloud services to implement their specific deployment workflows while maintaining consistency across the marketplace experience.

## Type-Specific Fields in React Final Form

The application uses a sophisticated type-based field selection system for creating dynamic React Final Form forms, exemplified by the `SupportSettingsForm.tsx` component.

### Core Pattern: Dynamic Field Selection

The primary pattern uses a `FieldRow` component that selects appropriate field types based on configuration:

```js
const FieldRow = ({ field, ...rest }) =>
  field.type === 'string' ? (
    <StringField {...rest} />
  ) : field.type === 'boolean' ? (
    <AwesomeCheckboxField
      label={getKeyTitle(field.key)}
      hideLabel
      className="mt-3"
      {...rest}
    />
  ) : field.type === 'email_field' ? (
    <EmailField {...rest} />
  ) : field.type === 'text_field' ? (
    <TextField {...rest} />
  ) : field.type === 'integer' ? (
    <NumberField {...rest} />
  ) : field.type === 'secret_field' ? (
    <SecretField {...rest} />
  ) : (
    <StringField {...rest} />
  );
```

### Field Type System

The application supports these field types:

- **`string`** - Basic text input using `StringField`
- **`boolean`** - Checkbox using `AwesomeCheckboxField`
- **`email_field`** - Email input with validation using `EmailField`
- **`text_field`** - Multi-line text using `TextField`
- **`integer`** - Numeric input using `NumberField`
- **`secret_field`** - Password/secret input using `SecretField`

### React Final Form Integration

All fields are wrapped with React Final Form's `Field` component and `FormGroup`:

```js
<Field
  component={FormGroup}
  name={field.key}
  key={field.key}
  label={field.description}
>
  <FieldRow field={field} />
</Field>
```

### Base FormField Interface

All field components extend the `FormField` interface for consistent props:

```js
export interface FormField {
  name?: string;
  input?: WrappedFieldInputProps;
  meta?: WrappedFieldMetaProps;
  required?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  tooltip?: ReactNode;
  validate?: Validator | Validator[];
  disabled?: boolean;
  hideLabel?: boolean;
  normalize?: Normalizer;
  format?: Formatter | null;
  parse?: Parser;
  noUpdateOnBlur?: boolean;
  onBlur?(e): void;
  containerClassName?: string;
  spaceless?: boolean;
  readOnly?: boolean;
}
```

### Configuration-Driven Forms

Forms are generated from configuration objects:

```js
export const SupportSettingsForm = ({ name }) => {
  const fields = SettingsDescription.find((group) =>
    group.description.toLowerCase().includes(name),
  ).items;

  return (
    <>
      {fields.map((field) => (
        <Field
          component={FormGroup}
          name={field.key}
          key={field.key}
          label={field.description}
        >
          <FieldRow field={field} />
        </Field>
      ))}
    </>
  );
};
```

### Field Configuration Structure

```js
{
  key: 'FIELD_NAME',
  description: 'Field description',
  default: 'default_value',
  type: 'string' | 'boolean' | 'integer' | 'email_field' | 'text_field' | 'secret_field'
}
```

### Advanced Field Factory Pattern

For more complex scenarios, the system uses a comprehensive field factory:

```js
const getFieldComponent = useCallback((field, index, { key, ...props }) => {
  if (field.component) {
    return <field.component key={key} {...props} {...(field.extraProps || {})} />;
  } else if (field.type === 'string') {
    return <StringField key={key} {...props} validate={field.validate} />;
  } else if (field.type === 'json') {
    return <MonacoField key={key} {...props} language="json" validate={validateJSON} />;
  } else if (field.type === 'datetime') {
    return <DateTimeField key={key} {...props} />;
  } else if (field.type === 'select') {
    return <SelectField key={key} {...props} options={field.options} />;
  } else if (field.type === 'async_select') {
    return <AsyncSelectField key={key} {...props} {...field.extraProps} />;
  }
  // ... other field types
}, []);
```

### Validation and Error Handling

The system provides comprehensive validation through:

```js
// Core validators
export const required = (value) =>
  value || value === 0 ? undefined : translate('This field is required.');

export const email = (value) =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? translate('Invalid email address')
    : undefined;

// Validator composition
export const composeValidators = (...validators) => (value) =>
  validators.reduce((error, validator) => error || validator(value), undefined);
```

### Best Practices for Type-Safe Forms

1. **Consistent Type Strings**: Use standardized type identifiers across field configurations
2. **Fallback Strategy**: Always provide a default field type (typically `StringField`)
3. **Props Interface**: Extend the base `FormField` interface for type safety
4. **Validator Composition**: Use `composeValidators` for complex validation logic
5. **Error Handling**: Integrate with React Final Form's meta.touched state for error display
6. **Configuration-Driven**: Use data structures to define forms rather than hardcoding

This type-specific field system enables dynamic form generation while maintaining type safety and consistent user experience across the application.

## Component Prop Reference

Prop tables extracted from TypeScript interfaces. Use these to generate correct props without reading source files.

### Buttons

#### ActionButton

```ts
import { ActionButton } from '@/table/ActionButton';
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | `(event?: any) => void` | yes | — | Click handler |
| `title` | `string` | no | — | Button label text |
| `iconNode` | `ReactNode` | no | — | Icon to display |
| `iconRight` | `boolean` | no | `false` | Place icon on the right instead of left |
| `variant` | `string` | no | `'tertiary'` | Design token button variant |
| `disabled` | `boolean` | no | `false` | Disabled state |
| `tooltip` | `string` | no | — | Tooltip text. **REQUIRED when `disabled` is true** |
| `pending` | `boolean` | no | `false` | Shows spinner and disables button |
| `className` | `string` | no | — | Additional CSS classes |
| `visibility` | `{ minWidth?: number; maxWidth?: number }` | no | — | Responsive visibility constraints |
| `data-testid` | `string` | no | — | Test ID attribute |

---

#### CompactActionButton

```ts
import { CompactActionButton } from '@/table/CompactActionButton';
```

Same props as `ActionButton` (without `visibility`). Use for tight spaces — renders at `sm` size.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | `(event?: any) => void` | yes | — | Click handler |
| `title` | `string` | no | — | Button label text |
| `iconNode` | `ReactNode` | no | — | Icon to display |
| `iconRight` | `boolean` | no | `false` | Place icon on the right instead of left |
| `variant` | `string` | no | `'tertiary'` | Design token button variant |
| `disabled` | `boolean` | no | `false` | Disabled state |
| `tooltip` | `string` | no | — | Tooltip text. **REQUIRED when `disabled` is true** |
| `pending` | `boolean` | no | `false` | Shows spinner and disables button |
| `className` | `string` | no | — | Additional CSS classes |

---

#### SubmitButton

```ts
import { SubmitButton } from '@/form';
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `submitting` | `boolean` | yes | — | Shows spinner and disables button while true |
| `label` | `ReactNode` | no | — | Button label text |
| `children` | `ReactNode` | no | — | Alternative to `label` |
| `variant` | `string` | no | `'primary'` | Design token button variant |
| `disabled` | `boolean` | no | `false` | Disabled state independent of `submitting` |
| `invalid` | `boolean` | no | `false` | Disables button when form is invalid |
| `type` | `'submit' \| 'button'` | no | `'submit'` | Button type |
| `onClick` | `(event: React.MouseEvent<HTMLButtonElement>) => void` | no | — | Click handler |
| `iconNode` | `ReactNode` | no | — | Icon to display |
| `iconOnLeft` | `boolean` | no | `false` | Place icon on the left (default is right) |
| `id` | `string` | no | — | HTML id attribute |
| `form` | `string` | no | — | Associates button with a form by id |
| `className` | `string` | no | — | Additional CSS classes |
| `data-*` | `string` | no | — | Any `data-` attribute for testing/integration |

---

#### CompactSubmitButton

```ts
import { CompactSubmitButton } from '@/form';
```

Same props as `SubmitButton` (without `form`). Renders at `sm` size — use inside popovers and inline forms.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `submitting` | `boolean` | yes | — | Shows spinner and disables button while true |
| `label` | `ReactNode` | no | — | Button label text |
| `children` | `ReactNode` | no | — | Alternative to `label` |
| `variant` | `string` | no | `'primary'` | Design token button variant |
| `disabled` | `boolean` | no | `false` | Disabled state independent of `submitting` |
| `invalid` | `boolean` | no | `false` | Disables button when form is invalid |
| `type` | `'submit' \| 'button'` | no | `'submit'` | Button type |
| `onClick` | `(event: React.MouseEvent<HTMLButtonElement>) => void` | no | — | Click handler |
| `iconNode` | `ReactNode` | no | — | Icon to display |
| `iconOnLeft` | `boolean` | no | `false` | Place icon on the left (default is right) |
| `id` | `string` | no | — | HTML id attribute |
| `className` | `string` | no | — | Additional CSS classes |

---

#### IconButton

```ts
import { IconButton } from '@/core/buttons/IconButton';
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `iconNode` | `ReactNode` | yes | — | Icon to display |
| `tooltip` | `string` | yes | — | Tooltip text. **Required for accessibility** |
| `onClick` | `(event: React.MouseEvent) => void` | yes | — | Click handler |
| `variant` | `ButtonVariant` | no | — | Design token button variant |
| `disabled` | `boolean` | no | `false` | Disabled state |
| `pending` | `boolean` | no | `false` | Shows spinner while true |
| `type` | `'button' \| 'submit'` | no | `'button'` | Button type |
| `className` | `string` | no | — | Additional CSS classes |
| `data-testid` | `string` | no | — | Test ID attribute |

---

#### CompactIconButton

```ts
import { CompactIconButton } from '@/core/buttons/IconButton';
```

Identical props to `IconButton`. Renders at `sm` size.

---

#### ToolbarButton

```ts
import { ToolbarButton } from '@/table/ToolbarButton';
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `iconNode` | `ReactNode` | yes | — | Icon to display |
| `onClick` | `(event: React.MouseEvent) => void` | yes | — | Click handler |
| `title` | `string` | no | — | Button label text (omit for icon-only) |
| `tooltip` | `string` | no | — | Tooltip text shown on hover |
| `variant` | `ButtonVariant` | no | — | Design token button variant |
| `disabled` | `boolean` | no | `false` | Disabled state |
| `pending` | `boolean` | no | `false` | Shows spinner while true |
| `badge` | `number \| string` | no | — | Badge count to display (e.g. active filter count) |
| `className` | `string` | no | — | Additional CSS classes |

---

#### BaseButton

```ts
import { BaseButton } from '@/core/buttons/BaseButton';
```

**Do not use in feature code.** This is an internal primitive used by the higher-level button components. Feature code must use the specific button components (`ActionButton`, `SubmitButton`, `ToolbarButton`, etc.) which already cover all use cases.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `size` | `'sm' \| 'lg'` | yes | — | Button size |
| `label` | `ReactNode` | no | — | Button label text |
| `onClick` | `(event?: any) => void` | no | — | Click handler |
| `iconNode` | `ReactNode` | no | — | Icon to display |
| `iconRight` | `boolean` | no | `false` | Place icon on the right instead of left |
| `variant` | `ButtonVariant` | no | — | Design token button variant |
| `disabled` | `boolean` | no | `false` | Disabled state |
| `tooltip` | `string` | no | — | Tooltip text. **REQUIRED when `disabled` is true** |
| `pending` | `boolean` | no | `false` | Shows spinner and disables button |
| `type` | `'button' \| 'submit'` | no | `'button'` | Button type |
| `id` | `string` | no | — | HTML id attribute |
| `form` | `string` | no | — | Associates button with a form by id |
| `className` | `string` | no | — | Additional CSS classes |
| `data-*` | `string` | no | — | Any `data-` attribute for testing/integration |

---

### Data Display

#### Badge

```ts
import { Badge } from '@/core/Badge';
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `Variant \| 'pink' \| 'blue' \| 'teal' \| 'indigo' \| 'purple' \| 'rose' \| 'orange' \| 'moss'` | no | — | Badge color variant |
| `leftIcon` | `ReactNode` | no | — | Icon displayed on left |
| `rightIcon` | `ReactNode` | no | — | Icon displayed on right |
| `onlyIcon` | `boolean` | no | `false` | Show icon only, no text |
| `alignIcon` | `boolean` | no | `false` | Align icon vertically |
| `tooltip` | `ReactNode` | no | — | Tooltip text |
| `tooltipProps` | `Partial<TipProps>` | no | — | Custom tooltip configuration |
| `light` | `boolean` | no | `false` | Use light background |
| `outline` | `boolean` | no | `false` | Use outline style |
| `pill` | `boolean` | no | `false` | Use pill (rounded) shape |
| `roundless` | `boolean` | no | `false` | Remove border radius |
| `hasBullet` | `boolean` | no | `false` | Include bullet point |
| `size` | `'sm' \| 'lg'` | no | — | Badge size |

---

#### StateIndicator

```ts
import { StateIndicator } from '@/core/StateIndicator';
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | yes | — | Display label |
| `variant` | `Variant` | yes | — | Color variant |
| `tooltip` | `string` | no | — | Tooltip text |
| `active` | `boolean` | no | `false` | Shows loading spinner when true |
| `light` | `boolean` | no | `false` | Use light background |
| `outline` | `boolean` | no | `false` | Use outline style |
| `pill` | `boolean` | no | `false` | Use pill (rounded) shape |
| `roundless` | `boolean` | no | `false` | Remove border radius |
| `hasBullet` | `boolean` | no | `false` | Include bullet point |
| `size` | `'sm' \| 'lg'` | no | — | Badge size |

---

#### NoResult

```ts
import { NoResult } from '@/navigation/header/search/NoResult';
```

Use for **all empty states**. Always provide an actionable CTA via `callback`+`buttonTitle` or `actions`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | no | — | Empty state heading |
| `message` | `ReactNode` | no | — | Empty state body text |
| `buttonTitle` | `string` | no | — | Label for the default action button |
| `callback` | `() => void` | no | — | Handler for the default action button |
| `actions` | `ReactNode` | no | — | Custom action buttons/elements (alternative to `callback`) |
| `isVisible` | `boolean` | no | `true` | Control component visibility |
| `className` | `string` | no | — | Additional CSS classes |
| `style` | `CSSProperties` | no | — | Inline styles |

---

### Tables

#### Table

```ts
import { Table } from '@/table';
```

Key configuration props. Full interface is large — these are the most commonly used.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `rows` | `any[]` | yes | — | Row data array |
| `fetch` | `(force?: boolean) => void` | yes | — | Function to load data |
| `columns` | `Array<Column<RowType>>` | yes | — | Column definitions |
| `table` | `string` | no | — | Table identifier key (used for persisted state) |
| `rowKey` | `string` | no | `'uuid'` | Field used as row key |
| `title` | `ReactNode` | no | — | Table heading |
| `subtitle` | `ReactNode` | no | — | Table subheading |
| `hasPagination` | `boolean` | no | `true` | Enable pagination controls |
| `hasQuery` | `boolean` | no | `false` | Enable search input |
| `hasActionBar` | `boolean` | no | `true` | Show action bar above table |
| `hasHeaders` | `boolean` | no | `true` | Show column headers |
| `hasOptionalColumns` | `boolean` | no | `false` | Enable column visibility toggle |
| `enableExport` | `boolean` | no | `false` | Enable export functionality |
| `enableMultiSelect` | `boolean` | no | `false` | Enable row multi-select |
| `hoverable` | `boolean` | no | `false` | Enable row hover highlight |
| `rowClass` | `(({ row }) => string) \| string` | no | — | CSS class for individual rows |
| `rowActions` | `React.ComponentType<{ row; fetch }>` | no | — | Per-row actions component |
| `expandableRow` | `React.ComponentType<{ row; fetch }>` | no | — | Expandable row detail component |
| `isRowExpandable` | `(row: RowType) => boolean` | no | — | Controls which rows can be expanded |
| `tableActions` | `ReactNode` | no | — | Toolbar action buttons |
| `dropdownActions` | `ReactNode` | no | — | Actions shown in toolbar dropdown |
| `multiSelectActions` | `React.ComponentType<{ rows; refetch }>` | no | — | Bulk action component (requires `enableMultiSelect`) |
| `filters` | `JSX.Element` | no | — | Filter UI component |
| `filterPosition` | `'menu' \| 'sidebar' \| 'header'` | no | `'menu'` | Where to render filters |
| `placeholderComponent` | `ReactNode` | no | — | Custom empty state component |
| `placeholderActions` | `ReactNode` | no | — | Empty state action buttons |
| `emptyMessage` | `ReactNode` | no | — | Simple empty state message text |
| `hideRefresh` | `boolean` | no | `false` | Hide refresh button |
| `hideIfEmpty` | `boolean` | no | `false` | Hide entire table when no rows |
| `initialPageSize` | `number` | no | — | Initial number of rows per page |
| `gridItem` | `React.ComponentType<{ row }>` | no | — | Component for grid display mode |
| `tabs` | `TableTab[]` | no | — | Tab configuration |
| `footer` | `ReactNode` | no | — | Footer content |
| `className` | `string` | no | — | Table wrapper CSS classes |

---

### Forms

#### FormGroup (React Final Form)

```ts
import { FormGroup } from '@/marketplace/offerings/FormGroup';
```

Use this version inside React Final Form.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `ReactNode` | no | — | Field label |
| `description` | `ReactNode` | no | — | Help text displayed below field |
| `help` | `ReactNode` | no | — | Alternative help text |
| `helpEnd` | `boolean` | no | `false` | Place help text at end of label row |
| `required` | `boolean` | no | `false` | Shows red asterisk |
| `spaceless` | `boolean` | no | `false` | Remove bottom margin. Use on last field in a form |
| `space` | `number` | no | `7` | Bottom margin size |
| `quickAction` | `ReactNode` | no | — | Quick action element next to label |
| `controlId` | `string` | no | — | HTML `for` attribute on label |
| `id` | `string` | no | — | HTML id attribute |
| `className` | `string` | no | — | Additional CSS classes |
| `meta` | `FieldMetaState<any>` | no | — | React Final Form field metadata (for validation display) |

---

#### SelectField

```ts
import { SelectField } from '@/form';
```

Form field component. Use as `<Field name="..." component={SelectField as any} />`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `options` | `Array<{ value: any; label: string }>` | yes | — | Selectable options |
| `isMulti` | `boolean` | no | `false` | Enable multi-value selection |
| `simpleValue` | `boolean` | no | `false` | Store plain value instead of `{ value, label }` object |
| `getOptionValue` | `(option: any) => any` | no | — | Custom option value accessor |
| `placeholder` | `string` | no | — | Placeholder text |
| `isDisabled` | `boolean` | no | `false` | Disable the select |
| `isClearable` | `boolean` | no | `false` | Show clear button |
| `className` | `string` | no | — | Additional CSS classes |
| `noUpdateOnBlur` | `boolean` | no | `false` | Skip form blur update |

---

#### StringField

```ts
import { StringField } from '@/form';
```

Form field component. Use as `<Field name="..." component={StringField as any} />`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `placeholder` | `string` | no | — | Placeholder text |
| `disabled` | `boolean` | no | `false` | Disable the input |
| `readOnly` | `boolean` | no | `false` | Read-only state |
| `maxLength` | `number` | no | — | Maximum character length |
| `pattern` | `string` | no | — | HTML validation regex pattern |
| `autoFocus` | `boolean` | no | `false` | Focus input on mount |
| `solid` | `boolean` | no | `false` | Use solid background styling |
| `icon` | `ReactNode` | no | — | Icon displayed inside the input |
| `label` | `ReactNode` | no | — | Field label (used with `FormGroup`) |
| `description` | `ReactNode` | no | — | Help text below field |
| `tooltip` | `ReactNode` | no | — | Tooltip on label |
| `required` | `boolean` | no | `false` | Shows required indicator |
| `validate` | `Validator \| Validator[]` | no | — | Validation function(s) |
| `className` | `string` | no | — | Additional CSS classes on input |
| `containerClassName` | `string` | no | — | Additional CSS classes on wrapper |
| `spaceless` | `boolean` | no | `false` | Remove bottom margin |
