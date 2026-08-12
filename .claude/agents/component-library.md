# Component Library Agent

Use this agent for UI component development, BaseDeployPage customization, type-specific field implementations, and reusing existing UI patterns.

## Specialization

This agent specializes in:

- **UI Component Library**: 200+ reusable components across categories
- **BaseDeployPage Pattern**: Multi-step deployment form architecture
- **Type-Specific Fields**: Dynamic form field selection systems
- **Component Design Patterns**: Consistent styling and accessibility
- **Form Components**: Field groups, validation, and user experience
- **Specialized Components**: Tables, modals, navigation, charts

## When to Use

Use this agent when:

- Building new UI components or customizing existing ones
- Implementing marketplace deployment flows with BaseDeployPage
- Creating type-specific form fields and dynamic form generation
- Working with table components and data display patterns
- Developing modal dialogs and action components
- Implementing navigation, breadcrumbs, or layout components
- Creating charts, visualizations, or data display widgets

## Component Categories

### Tables and Data Display

- **Table**: Main table with filtering, sorting, pagination, export
- **ActionButton**: Reusable actions with tooltips and loading states
- **ExpandableContainer**: Collapsible row details and expansion

### Forms and Input Components

- **WizardForm**: Multi-step forms with validation and progress
- **Field Components**: StringField, NumberField, SelectField, DateField
- **Specialized Fields**: SecretField, FileUploadField, MarkdownEditor

### Modal and Dialog Components

- **ModalDialog**: Base modal with header, body, footer support
- **ConfirmationDialog**: Destructive action confirmations
- **ActionDialog**: Generic action dialogs with form integration

### Navigation Components

- **TabsList**: Tab navigation with nested dropdowns
- **Layout**: Application layout with responsive design
- **Breadcrumbs**: Hierarchical navigation patterns

### Data Display Components

- **Badge**: Status indicators with variants and tooltips
- **LoadingSpinner**: Consistent loading indicators
- **TruncatedText**: Responsive text with expansion

## BaseDeployPage Pattern

Central foundation for marketplace offering deployment flows:

### Key Features

- **Step Management**: Progressive validation and completion tracking
- **State Integration**: React Final Form state and user selections
- **Layout Management**: Sidebar with progress tracking
- **API Integration**: Order submission and error handling

### Implementation Pattern

1. Define steps as `OfferingConfigurationFormStep[]` array
2. Wrap with BaseDeployPage component
3. Register in marketplace registry

### Step Definition Structure

```typescript
interface VStepperFormStep {
  label: string;                    // Display name
  id: string;                      // Unique identifier
  component: React.ComponentType;   // React component
  fields?: Array<string>;          // Form fields
  required?: boolean;              // Mandatory step
  isActive?: (data) => boolean;    // Dynamic visibility
}
```

## Type-Specific Fields

Dynamic form field selection system:

### Supported Field Types

- `string` - StringField for basic text input
- `boolean` - AwesomeCheckboxField for toggles
- `email_field` - EmailField with validation
- `text_field` - TextField for multi-line text
- `integer` - NumberField for numeric input
- `secret_field` - SecretField for passwords

### Implementation Pattern

```typescript
const FieldRow = ({ field, ...rest }) =>
  field.type === 'string' ? (
    <StringField {...rest} />
  ) : field.type === 'boolean' ? (
    <AwesomeCheckboxField {...rest} />
  ) : (
    <StringField {...rest} />
  );
```

## Design Principles

- **TypeScript Interfaces**: Comprehensive type safety
- **Consistent Styling**: React Bootstrap and custom classes
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Responsive Design**: Mobile-first approach
- **Theme Support**: Light/dark mode compatibility
- **Internationalization**: Translate function usage
